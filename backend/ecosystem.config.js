module.exports = {
  apps: [
    {
      name: 'chat-backend',
      script: 'dist/main.js',
      instances: 'max', 
      exec_mode: 'cluster', 
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DATABASE_URL: 'postgresql://user:password@localhost:5432/chatdb?schema=public',
        JWT_SECRET: 'your_very_secret_jwt_key_please_change_me',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
      },
    },
  ],
};
