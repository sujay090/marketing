import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Create S3 instance
export const s3 = new AWS.S3();

// S3 Configuration
export const S3_CONFIG = {
  bucket: process.env.S3_BUCKET_NAME || 'marketing-app-storage',
  region: process.env.AWS_REGION || 'us-east-1',
  folders: {
    posters: 'posters/',
    customers: 'customers/',
    generated: 'generated/',
    processed: 'processed/',
    templates: 'templates/',
    logos: 'logos/'
  }
};

// Utility function to generate S3 key
export const generateS3Key = (folder, filename, userId) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop();
  return `${folder}${userId}/${timestamp}-${randomStr}.${extension}`;
};

// Utility function to get public URL
export const getS3PublicUrl = (key) => {
  return `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
};

// Upload file to S3
export const uploadToS3 = async (buffer, key, contentType) => {
  try {
    const params = {
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read', // Make files publicly accessible
      CacheControl: 'max-age=31536000' // Cache for 1 year
    };

    const result = await s3.upload(params).promise();
    return {
      success: true,
      key: result.Key,
      url: result.Location,
      etag: result.ETag
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from S3
export const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: S3_CONFIG.bucket,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return { success: false, error: error.message };
  }
};

// Generate presigned URL for temporary access
export const getPresignedUrl = (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Expires: expiresIn // URL expires in 1 hour by default
    };

    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Presigned URL Error:', error);
    return null;
  }
};

// Check if S3 is properly configured
export const testS3Connection = async () => {
  try {
    await s3.headBucket({ Bucket: S3_CONFIG.bucket }).promise();
    console.log('✅ S3 connection successful');
    return true;
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    return false;
  }
};
