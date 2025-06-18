# 🚀 Real-Time Chat Application

A modern, full-stack real-time chat application built with React, NestJS, Socket.IO, and PostgreSQL. Experience seamless communication with real-time messaging, user presence tracking, and a beautiful, responsive UI.

![Chat App Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Docker](https://img.shields.io/badge/Docker-Supported-blue)

## ✨ Features

### 🔐 Authentication & Security
- **JWT Authentication** - Secure user authentication with JSON Web Tokens
- **Protected Routes** - Route-level authentication guards
- **Secure Password Handling** - Bcrypt password hashing
- **Token Validation** - Automatic token expiration and refresh handling

### 💬 Real-Time Communication
- **Instant Messaging** - Real-time message delivery using Socket.IO
- **Live User Presence** - See who's online in real-time
- **Typing Indicators** - Visual feedback when users are typing
- **Message Grouping** - Intelligent message grouping by user and time
- **Connection Status** - Visual indicators for connection health

### 🏠 Room Management
- **Create Rooms** - Users can create public chat rooms
- **Join/Leave Rooms** - Seamless room joining and leaving
- **Room Discovery** - Browse and search available rooms
- **Member Count** - Real-time room member statistics
- **Room Descriptions** - Optional room descriptions for context

### 🎨 Modern UI/UX
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion powered animations
- **Loading States** - Elegant loading indicators throughout the app
- **Error Handling** - User-friendly error messages and recovery

### 📱 Mobile-First Design
- **Mobile Sidebar** - Collapsible navigation with hamburger menu
- **Touch-Friendly** - Optimized for touch interactions
- **Responsive Layout** - Adapts to any screen size
- **Mobile Chat Input** - Optimized message input for mobile devices

### 🔧 Advanced Features
- **Message History** - Persistent message storage with pagination
- **Online Status** - Real-time online/offline status indicators
- **Auto-Scroll** - Smart message area auto-scrolling
- **Duplicate Prevention** - Intelligent duplicate message handling
- **Reconnection Logic** - Automatic reconnection on connection loss

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe server development
- **Socket.IO** - Real-time WebSocket communication
- **Prisma ORM** - Modern database toolkit
- **PostgreSQL** - Robust relational database
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **PM2** - Production process manager

### DevOps & Deployment
- **Docker** - Containerized deployment
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Production web server and reverse proxy
- **Redis** - Session storage and caching

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

The easiest way to run the entire application with all dependencies:

```bash
# Clone the repository
git clone <repository-url>
cd chat-app

# Start all services with Docker Compose
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

**Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Database: localhost:5432

### Option 2: Local Development

For development with hot reloading and debugging:

#### Prerequisites
- Node.js 20+ 
- PostgreSQL 16+
- Redis (optional)

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up the database
npx prisma migrate dev
npx prisma generate

# Start the development server
npm run start:dev
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URLs

# Start the development server
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📝 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatdb?schema=public"

# JWT
JWT_SECRET="super-secret-jwt-key"

# Server
PORT=3000
FRONTEND_URL="http://localhost:5173"

# Redis (optional)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL="http://localhost:3000"
VITE_SOCKET_URL="http://localhost:3000"
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Run database migrations
docker-compose run --rm backend npm run prisma:migrate:dev

# Reset and rebuild everything
docker-compose down -v
docker-compose up --build
```

## 📁 Project Structure

```
chat-app/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── gateway/        # Socket.IO gateway
│   │   ├── messages/       # Messages module
│   │   ├── rooms/          # Rooms module
│   │   ├── prisma/         # Database service
│   │   └── common/         # Shared utilities
│   ├── prisma/             # Database schema & migrations
│   ├── Dockerfile          # Backend Docker configuration
│   └── ecosystem.config.js # PM2 configuration
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── api/            # API client
│   │   ├── types/          # TypeScript definitions
│   │   └── layouts/        # Layout components
│   ├── Dockerfile          # Frontend Docker configuration
│   └── nginx.conf          # Nginx configuration
└── docker-compose.yml      # Multi-container orchestration
```

## 🔧 Development

### Adding New Features

1. **Backend**: Create new modules in `backend/src/`
2. **Frontend**: Add components in `frontend/src/components/`
3. **Database**: Create migrations with `npx prisma migrate dev`
4. **Types**: Update TypeScript definitions in respective `types/` folders

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Testing Socket.IO

The application includes comprehensive Socket.IO event handling:

- `joinRoom` - Join a chat room
- `leaveRoom` - Leave a chat room
- `sendMessage` - Send a message
- `typing` - Start typing indicator
- `stopTyping` - Stop typing indicator

## 🚀 Production Deployment

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Build frontend: `npm run build`
4. Start backend with PM2: `pm2 start ecosystem.config.js`
5. Serve frontend with Nginx

**Happy Chatting! 💬✨** 