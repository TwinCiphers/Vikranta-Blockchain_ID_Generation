const cors = require('cors');

// CORS configuration for security
const corsOptions = {
    origin: function (origin, callback) {
        // Whitelist of allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://localhost',
            'https://localhost',
            'https://localhost:443',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8080',
            'http://127.0.0.1',
            'https://127.0.0.1',
            // Add your production domain here:
            // 'https://yourdomain.com',
            // 'https://www.yourdomain.com',
        ];
        
        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️  CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
};

module.exports = corsOptions;
