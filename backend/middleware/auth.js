const jwt = require('jsonwebtoken');
const SecurityLogger = require('./securityLogger');
const logger = SecurityLogger;

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and protects sensitive endpoints
 */

// Generate JWT token for authenticated users
const generateToken = (userId, role = 'authority', expiresIn = '24h') => {
    const payload = {
        userId,
        role,
        iat: Math.floor(Date.now() / 1000)
        // Don't manually set exp - let jwt.sign handle it via expiresIn option
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verify JWT token
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // Check if token is provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.authFailure('missing_token', req.ip, {
            endpoint: req.originalUrl,
            method: req.method
        });
        
        return res.status(401).json({ 
            success: false,
            error: 'Authentication required',
            message: 'No token provided' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check token expiration
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            logger.authFailure('token_expired', req.ip, {
                userId: decoded.userId,
                endpoint: req.originalUrl
            });
            
            return res.status(401).json({ 
                success: false,
                error: 'Token expired',
                message: 'Please login again' 
            });
        }
        
        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            iat: decoded.iat,
            exp: decoded.exp
        };
        
        logger.authSuccess(decoded.userId, req.ip, {
            endpoint: req.originalUrl,
            method: req.method
        });
        
        next();
    } catch (error) {
        // Handle different JWT errors
        let errorMessage = 'Invalid token';
        let errorType = 'invalid_token';
        
        if (error.name === 'TokenExpiredError') {
            errorMessage = 'Token expired';
            errorType = 'token_expired';
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Malformed token';
            errorType = 'malformed_token';
        } else if (error.name === 'NotBeforeError') {
            errorMessage = 'Token not yet valid';
            errorType = 'token_not_active';
        }
        
        logger.authFailure(errorType, req.ip, {
            endpoint: req.originalUrl,
            error: error.message
        });
        
        return res.status(403).json({ 
            success: false,
            error: 'Authentication failed',
            message: errorMessage
        });
    }
};

// Role-based access control
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required' 
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            logger.suspiciousActivity('unauthorized_role_access', req.ip, {
                userId: req.user.userId,
                userRole: req.user.role,
                requiredRoles: allowedRoles,
                endpoint: req.originalUrl
            });
            
            return res.status(403).json({ 
                success: false,
                error: 'Insufficient permissions',
                message: `Required role: ${allowedRoles.join(' or ')}` 
            });
        }
        
        next();
    };
};

// Refresh token (optional - for enhanced security)
const refreshToken = (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false,
            error: 'No token provided' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        // Verify old token (ignore expiration)
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { 
            ignoreExpiration: true 
        });
        
        // Check if token is too old to refresh (> 7 days)
        const tokenAge = Math.floor(Date.now() / 1000) - decoded.iat;
        if (tokenAge > 7 * 24 * 60 * 60) {
            return res.status(401).json({ 
                success: false,
                error: 'Token too old to refresh',
                message: 'Please login again' 
            });
        }
        
        // Generate new token
        const newToken = generateToken(decoded.userId, decoded.role);
        
        logger.authSuccess(decoded.userId, req.ip, {
            action: 'token_refresh'
        });
        
        res.json({ 
            success: true,
            token: newToken,
            expiresIn: '24h'
        });
    } catch (error) {
        logger.authFailure('token_refresh_failed', req.ip, {
            error: error.message
        });
        
        res.status(403).json({ 
            success: false,
            error: 'Invalid token' 
        });
    }
};

// Verify token endpoint (check if token is valid)
const verifyToken = (req, res) => {
    // If we reach here, token is valid (authenticateJWT passed)
    res.json({
        success: true,
        valid: true,
        user: {
            userId: req.user.userId,
            role: req.user.role,
            expiresAt: req.user.exp
        }
    });
};

module.exports = {
    generateToken,
    authenticateJWT,
    requireRole,
    refreshToken,
    verifyToken
};
