@echo off
echo 🚀 Starting Marketing App Backend...
echo ==================================

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo 📦 Node.js version: %NODE_VERSION%

REM Check if we're in the server directory
if not exist package.json (
    echo ❌ Please run this script from the server directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📥 Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️ Warning: .env file not found. Please make sure it exists.
    echo 📝 Required environment variables:
    echo    - MONGO_URI
    echo    - JWT_SECRET
    echo    - WHATSAPP_API_TOKEN
)

REM Create uploads directories
echo 📁 Creating upload directories...
if not exist uploads mkdir uploads
if not exist uploads\posters mkdir uploads\posters
if not exist uploads\customers mkdir uploads\customers
if not exist uploads\generated mkdir uploads\generated
if not exist uploads\processed mkdir uploads\processed
if not exist uploads\templates mkdir uploads\templates

REM Start the server
echo 🔥 Starting server...
echo 🌐 Server will be available at: http://localhost:5000
echo 📊 Health check: http://localhost:5000/health
echo ==================================

npm run dev
