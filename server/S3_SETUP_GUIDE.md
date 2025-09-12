# AWS S3 Storage Setup Guide

## 📋 Prerequisites

1. AWS Account
2. AWS IAM User with S3 permissions
3. S3 Bucket created

## 🚀 Step-by-Step Setup

### 1. Create AWS S3 Bucket

1. Go to AWS Console → S3
2. Click "Create bucket"
3. Bucket name: `marketing-app-storage` (or your preferred name)
4. Region: Choose your preferred region (e.g., `us-east-1`)
5. **Uncheck** "Block all public access" (we need public read access for images)
6. Create bucket

### 2. Create IAM User

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. Username: `marketing-app-s3-user`
4. Attach policies:
   - `AmazonS3FullAccess` (or create custom policy below)

#### Custom S3 Policy (Recommended):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::marketing-app-storage/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::marketing-app-storage"
        }
    ]
}
```

### 3. Get Access Keys

1. Go to IAM → Users → Select your user
2. Go to "Security credentials" tab
3. Click "Create access key"
4. Choose "Application running outside AWS"
5. **Copy and save** the Access Key ID and Secret Access Key

### 4. Configure Bucket CORS

1. Go to your S3 bucket → Permissions → CORS
2. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### 5. Update Environment Variables

Update your `.env` file with:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_actual_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=marketing-app-storage

# Storage Configuration
STORAGE_TYPE=s3
# STORAGE_TYPE=local (use this for local development)
```

## 🧪 Testing S3 Integration

### Test Connection:
```bash
# Start the server
npm run dev

# Check logs for:
# ✅ S3 connection successful
```

### Test Upload:
1. Use the poster upload API
2. Check if files appear in your S3 bucket
3. Verify public URLs work

## 💰 Cost Optimization

### S3 Pricing Tips:
1. **Lifecycle Policies**: Auto-delete old temp files
2. **Storage Classes**: Use IA (Infrequent Access) for old posters
3. **CloudFront**: Add CDN for better performance and lower costs

### Lifecycle Policy Example:
```json
{
    "Rules": [
        {
            "ID": "DeleteTempFiles",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "temp/"
            },
            "Expiration": {
                "Days": 7
            }
        }
    ]
}
```

## 🔄 Switching Between Local and S3

### For Development (Local):
```env
STORAGE_TYPE=local
```

### For Production (S3):
```env
STORAGE_TYPE=s3
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Access Denied**: Check IAM permissions
2. **CORS Error**: Verify CORS configuration
3. **File Not Found**: Check bucket name and region
4. **Upload Failed**: Verify file size limits

### Debug Mode:
```env
NODE_ENV=development
```

## 📊 Monitoring

### CloudWatch Metrics to Monitor:
- `BucketSizeBytes`
- `NumberOfObjects`
- `AllRequests`
- `GetRequests`
- `PutRequests`

## 🔒 Security Best Practices

1. **Never commit AWS credentials** to version control
2. Use **IAM roles** in production (EC2/ECS)
3. Enable **S3 bucket versioning**
4. Set up **S3 access logging**
5. Use **least privilege** IAM policies

## 📈 Scaling Considerations

### When your app grows:
1. **Multi-region buckets** for global users
2. **CloudFront CDN** for faster delivery
3. **Image optimization** with Lambda@Edge
4. **Separate buckets** per environment (dev/staging/prod)

## 🚀 Production Deployment

### Environment Variables for Production:
```env
NODE_ENV=production
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=prod_access_key
AWS_SECRET_ACCESS_KEY=prod_secret_key
S3_BUCKET_NAME=marketing-app-prod-storage
```

Remember to:
- Use different buckets for different environments
- Set up proper backup and disaster recovery
- Monitor costs and usage regularly
