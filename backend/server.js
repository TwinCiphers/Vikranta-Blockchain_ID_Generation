const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Security imports
const { helmetConfig, apiLimiter } = require('./middleware/security');
const corsOptions = require('./middleware/corsConfig');
const sanitizeInput = require('./middleware/sanitizer');
const { refreshToken, verifyToken, authenticateJWT } = require('./middleware/auth');
const { getStats } = require('./middleware/bruteForceProtection');

const app = express();

// ========== SECURITY MIDDLEWARE (Applied First) ==========
// 1. Helmet - Security headers
app.use(helmetConfig);

// 2. CORS - Controlled access
app.use(cors(corsOptions));

// 3. Body parsing with size limits (prevent payload attacks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Input sanitization (XSS protection)
app.use(sanitizeInput);

// 5. Static files
app.use(express.static(path.join(__dirname, '../frontend')));

const touristRoutes = require('./routes/tourist');
const authorityRoutes = require('./routes/authority');
const expirationChecker = require('./services/expirationChecker');

// ========== RATE LIMITING (DDoS Protection) ==========
// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// ========== ROUTES ==========
app.use('/api/tourist', touristRoutes);
app.use('/api/authority', authorityRoutes);

// Public verification endpoint (redirect to tourist verify route)
app.use('/api/verify', touristRoutes);

// ========== AUTH ENDPOINTS ==========
// Token refresh endpoint
app.post('/api/auth/refresh', refreshToken);

// Token verification endpoint
app.get('/api/auth/verify', authenticateJWT, verifyToken);

// Security status endpoint (protected)
app.get('/api/auth/security-status', authenticateJWT, (req, res) => {
    const bruteForceStats = getStats();
    res.json({
        success: true,
        security: {
            bruteForceProtection: bruteForceStats,
            jwtEnabled: true,
            rateLimitingEnabled: true,
            corsEnabled: true,
            helmetEnabled: true,
            inputSanitizationEnabled: true
        }
    });
});

// Health check endpoint for Docker
app.get('/api/tourist/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: Date.now(),
        service: 'tourist-registry-backend',
        expirationChecker: expirationChecker.getStatus()
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ========== ERROR HANDLING ==========
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Endpoint not found' 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    // CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ 
            success: false,
            error: 'Access denied - CORS policy' 
        });
    }
    
    // Rate limit errors
    if (err.status === 429) {
        return res.status(429).json({ 
            success: false,
            error: 'Too many requests, please try again later' 
        });
    }
    
    // Generic error
    res.status(err.status || 500).json({ 
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🛡️  Secure server running on http://localhost:${PORT}`);
    console.log(`📊 Security features enabled:`);
    console.log(`   ✅ Helmet (Security Headers)`);
    console.log(`   ✅ Rate Limiting (DDoS Protection)`);
    console.log(`   ✅ CORS (Access Control)`);
    console.log(`   ✅ Input Sanitization (XSS Protection)`);
    console.log(`   ✅ Request Size Limits`);
    console.log(`   ✅ JWT Authentication`);
    console.log(`   ✅ Brute Force Protection`);
    
    // Start expiration checker
    setTimeout(() => {
        expirationChecker.start();
        console.log('✅ Automatic expiration checker started');
    }, 5000); // Wait 5 seconds for blockchain to be ready
});