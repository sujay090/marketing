#!/bin/bash

echo "🚀 Starting Marketing App Backend..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo "📦 Node.js version: $NODE_VERSION"

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the server directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️ Warning: .env file not found. Creating a sample one..."
    cat > .env << EOL
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
WHATSAPP_API_TOKEN=your_whatsapp_token
MSGWAPI_TOKEN=your_msgwapi_token
BASE_URL=https://businesswhastapp.com
SERVER_URL=http://localhost:5000
EOL
    echo "📝 Please update the .env file with your actual values"
fi

# Create uploads directories
echo "📁 Creating upload directories..."
mkdir -p uploads/posters uploads/customers uploads/generated uploads/processed uploads/templates

# Start the server
echo "🔥 Starting server..."
echo "🌐 Server will be available at: http://localhost:5000"
echo "📊 Health check: http://localhost:5000/health"
echo "=================================="

npm run dev
