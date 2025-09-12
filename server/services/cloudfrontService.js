import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";

let cloudfront = null;

// Initialize CloudFront client
const initCloudFront = () => {
  if (!cloudfront && process.env.CLOUDFRONT_ENABLED === 'true') {
    cloudfront = new CloudFrontClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return cloudfront;
};

/**
 * Invalidate CloudFront cache for specific paths
 * @param {string[]} paths - Array of paths to invalidate (e.g., ['/posters/*', '/logos/customer123.png'])
 * @returns {Promise<boolean>} - Success status
 */
export const invalidateCloudFrontCache = async (paths) => {
  try {
    if (!process.env.CLOUDFRONT_ENABLED || process.env.CLOUDFRONT_ENABLED !== 'true') {
      console.log('📋 CloudFront not enabled, skipping cache invalidation');
      return false;
    }

    if (!process.env.CLOUDFRONT_DISTRIBUTION_ID) {
      console.warn('⚠️ CloudFront distribution ID not configured');
      return false;
    }

    const client = initCloudFront();
    if (!client) {
      console.warn('⚠️ CloudFront client not initialized');
      return false;
    }

    // Ensure paths start with /
    const formattedPaths = paths.map(path => path.startsWith('/') ? path : `/${path}`);

    const params = {
      DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `invalidation-${Date.now()}`,
        Paths: {
          Quantity: formattedPaths.length,
          Items: formattedPaths,
        },
      },
    };

    console.log('🔄 Invalidating CloudFront cache for paths:', formattedPaths);
    
    const command = new CreateInvalidationCommand(params);
    const result = await client.send(command);
    
    console.log('✅ CloudFront cache invalidation initiated:', result.Invalidation.Id);
    return true;
    
  } catch (error) {
    console.error('❌ CloudFront invalidation failed:', error.message);
    return false;
  }
};

/**
 * Get CloudFront URL for a file
 * @param {string} filePath - File path (e.g., 'posters/image.jpg')
 * @returns {string} - Full CloudFront URL or fallback URL
 */
export const getCloudFrontUrl = (filePath) => {
  if (process.env.CLOUDFRONT_ENABLED === 'true' && process.env.CLOUDFRONT_DISTRIBUTION_URL) {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return `${process.env.CLOUDFRONT_DISTRIBUTION_URL}/${cleanPath}`;
  }
  
  // Fallback to S3 direct URL or server URL
  if (process.env.STORAGE_TYPE === 's3') {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${cleanPath}`;
  }
  
  // Local storage fallback
  return `${process.env.SERVER_URL}/uploads/${filePath}`;
};

/**
 * Invalidate cache for poster-related files
 * @param {string} customerName - Customer name for targeted invalidation
 * @returns {Promise<boolean>} - Success status
 */
export const invalidatePosterCache = async (customerName = null) => {
  const paths = [];
  
  if (customerName) {
    // Invalidate specific customer's generated posters
    paths.push(`/generated/${customerName}/*`);
  } else {
    // Invalidate all poster-related content
    paths.push('/posters/*', '/processed/*', '/generated/*');
  }
  
  return await invalidateCloudFrontCache(paths);
};

/**
 * Invalidate cache for logo files
 * @param {string} logoFilename - Specific logo filename (optional)
 * @returns {Promise<boolean>} - Success status
 */
export const invalidateLogoCache = async (logoFilename = null) => {
  const paths = logoFilename ? [`/logos/${logoFilename}`] : ['/logos/*'];
  return await invalidateCloudFrontCache(paths);
};

export default {
  invalidateCloudFrontCache,
  getCloudFrontUrl,
  invalidatePosterCache,
  invalidateLogoCache
};
