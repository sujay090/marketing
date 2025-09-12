import fs from 'fs';
import path from 'path';

export const ensureDirectories = () => {
  const directories = [
    'uploads',
    'uploads/posters',
    'uploads/customers',
    'uploads/generated',
    'uploads/processed',
    'uploads/templates'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
  
  console.log('📁 Upload directories verified');
};

export const cleanupOldFiles = () => {
  // Clean up files older than 30 days from temp directories
  const tempDirs = ['uploads/temp'];
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  tempDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.readdir(dir, (err, files) => {
        if (err) return;
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          fs.stat(filePath, (err, stats) => {
            if (err) return;
            
            if (stats.mtime.getTime() < thirtyDaysAgo) {
              fs.unlink(filePath, (err) => {
                if (!err) console.log(`🗑️ Cleaned up old file: ${file}`);
              });
            }
          });
        });
      });
    }
  });
};

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }
  
  return true;
};
