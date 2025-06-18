#!/bin/bash

echo "🚀 Setting up Chat Application..."

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker and Docker Compose found"
    echo ""
    echo "Choose setup method:"
    echo "1) Docker (Recommended - Easy setup)"
    echo "2) Local Development (Manual setup)"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo "🐳 Starting with Docker..."
        echo "This will start PostgreSQL, Redis, Backend, and Frontend"
        echo ""
        docker-compose up --build
    elif [ "$choice" = "2" ]; then
        echo ""
        echo "💻 Setting up for local development..."
        echo ""
        
        # Check Node.js version
        if command -v node &> /dev/null; then
            NODE_VERSION=$(node -v | cut -d'v' -f2)
            echo "✅ Node.js found: v$NODE_VERSION"
        else
            echo "❌ Node.js not found. Please install Node.js 20+ first."
            exit 1
        fi
        
        # Setup backend
        echo ""
        echo "📦 Setting up backend..."
        cd backend
        
        # Create .env file
        if [ ! -f .env ]; then
            echo "Creating backend .env file..."
            cat > .env << EOL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatdb?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
REDIS_HOST="localhost"
REDIS_PORT=6379
LOG_LEVEL="debug"
EOL
        fi
        
        npm install
        echo "✅ Backend dependencies installed"
        
        # Setup frontend
        echo ""
        echo "📦 Setting up frontend..."
        cd ../frontend
        
        # Create .env file
        if [ ! -f .env ]; then
            echo "Creating frontend .env file..."
            cat > .env << EOL
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_NODE_ENV=development
EOL
        fi
        
        npm install
        echo "✅ Frontend dependencies installed"
        
        cd ..
        
        echo ""
        echo "🎉 Setup complete!"
        echo ""
        echo "Next steps:"
        echo "1. Make sure PostgreSQL is running on localhost:5432"
        echo "2. Run database migrations: cd backend && npx prisma migrate dev"
        echo "3. Start backend: cd backend && npm run start:dev"
        echo "4. Start frontend: cd frontend && npm run dev"
        echo ""
        echo "Or use Docker for easier setup: docker-compose up --build"
    else
        echo "Invalid choice. Please run the script again."
        exit 1
    fi
else
    echo "❌ Docker not found. Installing for local development..."
    echo ""
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        echo "✅ Node.js found: v$NODE_VERSION"
    else
        echo "❌ Node.js not found. Please install Node.js 20+ first."
        echo "Download from: https://nodejs.org/"
        exit 1
    fi
    
    # Setup backend
    echo ""
    echo "📦 Setting up backend..."
    cd backend
    
    # Create .env file
    if [ ! -f .env ]; then
        echo "Creating backend .env file..."
        cat > .env << EOL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatdb?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
REDIS_HOST="localhost"
REDIS_PORT=6379
LOG_LEVEL="debug"
EOL
    fi
    
    npm install
    echo "✅ Backend dependencies installed"
    
    # Setup frontend
    echo ""
    echo "📦 Setting up frontend..."
    cd ../frontend
    
    # Create .env file
    if [ ! -f .env ]; then
        echo "Creating frontend .env file..."
        cat > .env << EOL
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_NODE_ENV=development
EOL
    fi
    
    npm install
    echo "✅ Frontend dependencies installed"
    
    cd ..
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Install and start PostgreSQL on localhost:5432"
    echo "2. Run database migrations: cd backend && npx prisma migrate dev"
    echo "3. Start backend: cd backend && npm run start:dev"
    echo "4. Start frontend: cd frontend && npm run dev"
    echo ""
    echo "For easier setup, consider installing Docker:"
    echo "https://docs.docker.com/get-docker/"
fi 