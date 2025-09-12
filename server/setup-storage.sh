#!/bin/bash

# Marketing App Storage Setup Script
echo "🚀 Setting up storage for Marketing App..."

# Check current storage type
if [ -f ".env" ]; then
    STORAGE_TYPE=$(grep "STORAGE_TYPE=" .env | cut -d'=' -f2)
    echo "📋 Current storage type: $STORAGE_TYPE"
else
    echo "⚠️ No .env file found"
    STORAGE_TYPE="s3"
fi

if [ "$STORAGE_TYPE" = "local" ]; then
    echo "📁 Creating local upload directories..."
    
    # Create only essential directories for local development
    mkdir -p uploads/{posters,processed,generated,logos,temp}
    
    echo "✅ Created local directories:"
    echo "   📸 uploads/posters - Original poster templates"
    echo "   🎨 uploads/processed - Processed posters with placeholders"
    echo "   👥 uploads/generated - Customer-specific generated posters"
    echo "   🏢 uploads/logos - Customer logos"
    echo "   ⏳ uploads/temp - Temporary processing files"
    
    # Create .gitignore for uploads
    cat > uploads/.gitignore << EOL
# Ignore all uploaded files but keep folder structure
*
!.gitignore
!.gitkeep
EOL

    # Create .gitkeep files to maintain folder structure
    touch uploads/posters/.gitkeep
    touch uploads/processed/.gitkeep
    touch uploads/generated/.gitkeep
    touch uploads/logos/.gitkeep
    touch uploads/temp/.gitkeep
    
    echo "✅ Local storage setup complete!"
    
elif [ "$STORAGE_TYPE" = "s3" ]; then
    echo "☁️ Using S3 storage - no local directories needed"
    echo "📋 S3 bucket structure will be:"
    echo "   📸 posters/ - Original poster templates"
    echo "   🎨 processed/ - Processed posters with placeholders"  
    echo "   👥 generated/ - Customer-specific generated posters"
    echo "   🏢 logos/ - Customer logos"
    echo "   📂 templates/ - Template marketplace files"
    
    # Remove local uploads folder if it exists (optional)
    read -p "❓ Remove existing uploads folder? (y/N): " remove_uploads
    if [ "$remove_uploads" = "y" ] || [ "$remove_uploads" = "Y" ]; then
        rm -rf uploads
        echo "🗑️ Removed local uploads folder"
    fi
    
    echo "✅ S3 storage setup complete!"
    echo "🔧 Make sure to configure your S3 credentials in .env"
    
else
    echo "❓ Storage type not specified, setting up for both..."
    
    # Create minimal local structure for fallback
    mkdir -p uploads/{posters,processed,generated,logos}
    touch uploads/{posters,processed,generated,logos}/.gitkeep
    
    echo "✅ Hybrid storage setup complete!"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Check your .env file for correct STORAGE_TYPE"
echo "2. If using S3, follow S3_SETUP_GUIDE.md"
echo "3. Test file upload functionality"
echo "4. Monitor storage usage and costs"
