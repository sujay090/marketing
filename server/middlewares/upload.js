import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure base directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
};

// Initialize all required directories
const initializeDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/posters',
    'uploads/logos', 
    'uploads/customers',
    'uploads/generated',
    'uploads/processed',
    'uploads/templates',
    'uploads/temp'
  ];
  
  dirs.forEach(ensureDirectoryExists);
};

// Initialize on import
initializeDirectories();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder;
    
    // Determine folder based on fieldname and route
    if (file.fieldname === 'logo') {
      folder = 'uploads/logos';
    } else if (file.fieldname === 'posters' || file.fieldname === 'image') {
      folder = 'uploads/posters';
    } else if (file.fieldname === 'template') {
      folder = 'uploads/templates';
    } else {
      folder = 'uploads/temp'; // Fallback for unknown field names
    }
    
    // Ensure the specific folder exists
    ensureDirectoryExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  },
});

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

// Configure multer
export const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }, 
  fileFilter
});

// Error handling middleware for multer errors
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum file size is 10MB.',
        error: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 5 files allowed.',
        error: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected field name. Please check the form field name.',
        error: 'UNEXPECTED_FIELD'
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
