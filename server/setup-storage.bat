@echo off
echo 🚀 Setting up storage for Marketing App...

REM Check if .env file exists
if not exist .env (
    echo ⚠️ No .env file found
    set STORAGE_TYPE=s3
    goto :setup
)

REM Read storage type from .env
for /f "tokens=2 delims==" %%i in ('findstr "STORAGE_TYPE=" .env') do set STORAGE_TYPE=%%i
echo 📋 Current storage type: %STORAGE_TYPE%

:setup
if "%STORAGE_TYPE%"=="local" (
    echo 📁 Creating local upload directories...
    
    REM Create essential directories for local development
    if not exist uploads mkdir uploads
    if not exist uploads\posters mkdir uploads\posters
    if not exist uploads\processed mkdir uploads\processed
    if not exist uploads\generated mkdir uploads\generated
    if not exist uploads\logos mkdir uploads\logos
    if not exist uploads\temp mkdir uploads\temp
    
    echo ✅ Created local directories:
    echo    📸 uploads\posters - Original poster templates
    echo    🎨 uploads\processed - Processed posters with placeholders
    echo    👥 uploads\generated - Customer-specific generated posters
    echo    🏢 uploads\logos - Customer logos
    echo    ⏳ uploads\temp - Temporary processing files
    
    REM Create .gitignore for uploads
    echo # Ignore all uploaded files but keep folder structure > uploads\.gitignore
    echo * >> uploads\.gitignore
    echo !.gitignore >> uploads\.gitignore
    echo !.gitkeep >> uploads\.gitignore
    
    REM Create .gitkeep files to maintain folder structure
    echo. > uploads\posters\.gitkeep
    echo. > uploads\processed\.gitkeep
    echo. > uploads\generated\.gitkeep
    echo. > uploads\logos\.gitkeep
    echo. > uploads\temp\.gitkeep
    
    echo ✅ Local storage setup complete!
    
) else if "%STORAGE_TYPE%"=="s3" (
    echo ☁️ Using S3 storage - no local directories needed
    echo 📋 S3 bucket structure will be:
    echo    📸 posters/ - Original poster templates
    echo    🎨 processed/ - Processed posters with placeholders  
    echo    👥 generated/ - Customer-specific generated posters
    echo    🏢 logos/ - Customer logos
    echo    📂 templates/ - Template marketplace files
    
    echo ✅ S3 storage setup complete!
    echo 🔧 Make sure to configure your S3 credentials in .env
    
) else (
    echo ❓ Storage type not specified, setting up for both...
    
    REM Create minimal local structure for fallback
    if not exist uploads mkdir uploads
    if not exist uploads\posters mkdir uploads\posters
    if not exist uploads\processed mkdir uploads\processed
    if not exist uploads\generated mkdir uploads\generated
    if not exist uploads\logos mkdir uploads\logos
    
    echo. > uploads\posters\.gitkeep
    echo. > uploads\processed\.gitkeep
    echo. > uploads\generated\.gitkeep
    echo. > uploads\logos\.gitkeep
    
    echo ✅ Hybrid storage setup complete!
)

echo.
echo 🎯 Next steps:
echo 1. Check your .env file for correct STORAGE_TYPE
echo 2. If using S3, follow S3_SETUP_GUIDE.md
echo 3. Test file upload functionality
echo 4. Monitor storage usage and costs

pause
