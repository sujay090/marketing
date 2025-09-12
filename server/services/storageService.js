import { uploadToS3, deleteFromS3, getS3PublicUrl, generateS3Key, S3_CONFIG } from '../config/s3.js';
import { getCloudFrontUrl, invalidatePosterCache, invalidateLogoCache } from './cloudfrontService.js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export class StorageService {
  constructor() {
    this.isS3 = process.env.STORAGE_TYPE !== 'local';
  }

  /**
   * Upload file to storage (S3 or local)
   */
  async uploadFile(buffer, folder, filename, contentType = 'image/png', userId = 'anonymous') {
    if (this.isS3) {
      const key = generateS3Key(folder, filename, userId);
      const result = await uploadToS3(buffer, key, contentType);
      
      if (result.success) {
        return {
          success: true,
          path: result.key,
          url: result.url,
          storage: 's3'
        };
      } else {
        throw new Error(`S3 upload failed: ${result.error}`);
      }
    } else {
      // Local storage
      const uploadDir = path.join('uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(filename);
      const localFilename = `${timestamp}-${randomStr}${extension}`;
      const filePath = path.join(uploadDir, localFilename);
      
      fs.writeFileSync(filePath, buffer);
      
      const serverURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
      const url = `${serverURL}/${filePath.replace(/\\/g, '/')}`;
      
      return {
        success: true,
        path: filePath,
        url: url,
        storage: 'local'
      };
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath) {
    if (this.isS3) {
      return await deleteFromS3(filePath);
    } else {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }

  /**
   * Get file URL with CloudFront support
   */
  getFileUrl(filePath) {
    // Use CloudFront URL if enabled
    if (process.env.CLOUDFRONT_ENABLED === 'true' && this.isS3) {
      return getCloudFrontUrl(filePath);
    }
    
    if (this.isS3) {
      return getS3PublicUrl(filePath);
    } else {
      const serverURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
      return `${serverURL}/${filePath.replace(/\\/g, '/')}`;
    }
  }

  /**
   * Process and upload poster image
   */
  async processAndUploadPoster(originalImageBuffer, svgOverlay, category, userId) {
    try {
      // Create composite image
      const finalImageBuffer = await sharp(originalImageBuffer)
        .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
        .png()
        .toBuffer();

      // Upload processed image
      const folder = this.isS3 ? S3_CONFIG.folders.processed : 'processed';
      const filename = `${category}-${Date.now()}-processed.png`;
      
      const result = await this.uploadFile(finalImageBuffer, folder, filename, 'image/png', userId);
      
      // Invalidate CloudFront cache for processed posters
      if (result.success && this.isS3) {
        await invalidatePosterCache();
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to process and upload poster: ${error.message}`);
    }
  }

  /**
   * Generate poster for customer
   */
  async generateCustomerPoster(originalImagePath, svgOverlay, customerId, posterId, category) {
    try {
      let imageBuffer;
      
      if (this.isS3) {
        // Download from S3
        const AWS = await import('aws-sdk');
        const s3 = new AWS.S3();
        const s3Object = await s3.getObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: originalImagePath
        }).promise();
        imageBuffer = s3Object.Body;
      } else {
        // Read local file
        imageBuffer = fs.readFileSync(originalImagePath);
      }

      // Create composite image
      const finalImageBuffer = await sharp(imageBuffer)
        .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
        .png()
        .toBuffer();

      // Upload generated image
      const folder = this.isS3 ? S3_CONFIG.folders.generated : 'generated';
      const filename = `${customerId}_${posterId}_${category}.png`;
      
      const result = await this.uploadFile(finalImageBuffer, folder, filename, 'image/png', customerId);
      
      // Invalidate CloudFront cache for generated posters
      if (result.success && this.isS3) {
        await invalidatePosterCache(customerId);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to generate customer poster: ${error.message}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    if (this.isS3) {
      // S3 statistics would require AWS CloudWatch or custom tracking
      return {
        type: 's3',
        bucket: process.env.S3_BUCKET_NAME,
        message: 'S3 storage active - use AWS Console for detailed statistics'
      };
    } else {
      // Local storage statistics
      const folders = ['uploads/posters', 'uploads/processed', 'uploads/generated', 'uploads/logos'];
      let totalSize = 0;
      let totalFiles = 0;

      for (const folder of folders) {
        if (fs.existsSync(folder)) {
          const files = fs.readdirSync(folder);
          totalFiles += files.length;
          
          for (const file of files) {
            const filePath = path.join(folder, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
          }
        }
      }

      return {
        type: 'local',
        totalFiles,
        totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
        folders: folders.length
      };
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
