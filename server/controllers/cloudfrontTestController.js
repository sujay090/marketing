import { getCloudFrontUrl, invalidateCloudFrontCache } from '../services/cloudfrontService.js';

// Test CloudFront functionality
export const testCloudFront = async (req, res) => {
  try {
    console.log('🧪 Testing CloudFront integration...');
    
    const testResults = {
      configCheck: {},
      urlGeneration: {},
      cacheInvalidation: {}
    };

    // 1. Check CloudFront configuration
    testResults.configCheck = {
      enabled: process.env.CLOUDFRONT_ENABLED === 'true',
      distributionUrl: process.env.CLOUDFRONT_DISTRIBUTION_URL || 'Not configured',
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || 'Not configured',
      storageType: process.env.STORAGE_TYPE || 'local'
    };

    // 2. Test URL generation
    const testFilePath = 'posters/test-image.jpg';
    const cloudFrontUrl = getCloudFrontUrl(testFilePath);
    const directS3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${testFilePath}`;
    
    testResults.urlGeneration = {
      testFilePath,
      cloudFrontUrl,
      directS3Url,
      isCloudFrontUsed: cloudFrontUrl !== directS3Url
    };

    // 3. Test cache invalidation (if enabled)
    if (process.env.CLOUDFRONT_ENABLED === 'true') {
      const invalidationResult = await invalidateCloudFrontCache(['/test/*']);
      testResults.cacheInvalidation = {
        tested: true,
        result: invalidationResult,
        timestamp: new Date().toISOString()
      };
    } else {
      testResults.cacheInvalidation = {
        tested: false,
        reason: 'CloudFront not enabled'
      };
    }

    console.log('✅ CloudFront test completed');
    
    res.json({
      message: 'CloudFront integration test completed',
      results: testResults,
      recommendations: generateRecommendations(testResults)
    });

  } catch (error) {
    console.error('❌ CloudFront test failed:', error);
    res.status(500).json({
      message: 'CloudFront test failed',
      error: error.message
    });
  }
};

function generateRecommendations(results) {
  const recommendations = [];
  
  if (!results.configCheck.enabled) {
    recommendations.push('Enable CloudFront by setting CLOUDFRONT_ENABLED=true in .env');
  }
  
  if (results.configCheck.distributionUrl === 'Not configured') {
    recommendations.push('Configure CLOUDFRONT_DISTRIBUTION_URL in .env');
  }
  
  if (results.configCheck.distributionId === 'Not configured') {
    recommendations.push('Configure CLOUDFRONT_DISTRIBUTION_ID in .env');
  }
  
  if (results.configCheck.storageType === 'local' && results.configCheck.enabled) {
    recommendations.push('CloudFront works best with S3 storage. Consider setting STORAGE_TYPE=s3');
  }
  
  return recommendations;
}
