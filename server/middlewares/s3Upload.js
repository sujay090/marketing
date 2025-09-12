import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3, S3_CONFIG, generateS3Key } from '../config/s3.js';
import path from 'path';

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed! Supported formats: JPG, JPEG, PNG, WebP'), false);
  }
  
  // Check for allowed image formats
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid image format! Only JPG, PNG, and WebP are allowed.'), false);
  }
  
  cb(null, true);
};

// S3 Storage Configuration
const s3Storage = multerS3({
  s3: s3,
  bucket: S3_CONFIG.bucket,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const userId = req.admin?.id || 'anonymous';
    let folder;
    
    // Determine folder based on fieldname
    switch (file.fieldname) {
      case 'logo':
        folder = S3_CONFIG.folders.logos;
        break;
      case 'posters':
      case 'image':
        folder = S3_CONFIG.folders.posters;
        break;
      case 'template':
        folder = S3_CONFIG.folders.templates;
        break;
      default:
        folder = 'misc/';
    }
    
    const s3Key = generateS3Key(folder, file.originalname, userId);
    cb(null, s3Key);
  },
  metadata: function (req, file, cb) {
    cb(null, {
      fieldName: file.fieldname,
      originalName: file.originalname,
      uploadedBy: req.admin?.id || 'anonymous',
      uploadedAt: new Date().toISOString()
    });
  }
});

// Local Storage Configuration (fallback)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder;
    
    if (file.fieldname === 'logo') {
      folder = 'uploads/logos';
    } else if (file.fieldname === 'posters' || file.fieldname === 'image') {
      folder = 'uploads/posters';
    } else if (file.fieldname === 'template') {
      folder = 'uploads/templates';
    } else {
      folder = 'uploads/temp';
    }
    
    // Ensure directory exists
    import('fs').then(fs => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
    });
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Choose storage based on environment
const storage = process.env.STORAGE_TYPE === 'local' ? localStorage : s3Storage;

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer errors
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'File too large. Maximum file size is 10MB.',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Too many files. Maximum 5 files allowed.',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Unexpected field name. Please check the form field name.',
          error: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({
          message: 'Upload error occurred.',
          error: error.code
        });
    }
  }
  
  // Handle other upload errors
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  next(error);
};

// Utility function to get file URL
export const getFileUrl = (file) => {
  if (process.env.STORAGE_TYPE === 'local') {
    const serverURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${serverURL}/${file.path.replace(/\\/g, '/')}`;
  } else {
    // S3 storage
    return file.location;
  }
};

// Utility function to delete file
export const deleteFile = async (fileKey) => {
  if (process.env.STORAGE_TYPE === 'local') {
    // Delete local file
    const fs = await import('fs');
    try {
      if (fs.existsSync(fileKey)) {
        fs.unlinkSync(fileKey);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Delete from S3
    const { deleteFromS3 } = await import('../config/s3.js');
    return await deleteFromS3(fileKey);
  }
};
