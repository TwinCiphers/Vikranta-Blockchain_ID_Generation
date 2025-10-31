const logger = require('./securityLogger');

/**
 * Brute Force Protection Middleware
 * Tracks failed login attempts and automatically bans IPs after threshold
 */

// In-memory store for failed attempts (use Redis in production)
const failedAttempts = new Map();
const bannedIPs = new Map();

// Configuration
const MAX_ATTEMPTS = 5;           // Maximum failed attempts
const ATTEMPT_WINDOW = 15 * 60 * 1000;  // 15 minutes
const BAN_DURATION = 60 * 60 * 1000;    // 1 hour
const PERMANENT_BAN_THRESHOLD = 20; // Permanent ban after 20 total failures

/**
 * Track failed login attempt
 */
const trackFailedAttempt = (identifier) => {
    const now = Date.now();
    
    if (!failedAttempts.has(identifier)) {
        failedAttempts.set(identifier, []);
    }
    
    const attempts = failedAttempts.get(identifier);
    
    // Add new attempt
    attempts.push(now);
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < ATTEMPT_WINDOW);
    failedAttempts.set(identifier, recentAttempts);
    
    // Check if should ban
    if (recentAttempts.length >= MAX_ATTEMPTS) {
        const totalAttempts = attempts.length;
        const banDuration = totalAttempts >= PERMANENT_BAN_THRESHOLD ? 
            Infinity : BAN_DURATION;
        
        bannedIPs.set(identifier, {
            bannedAt: now,
            duration: banDuration,
            reason: totalAttempts >= PERMANENT_BAN_THRESHOLD ? 
                'permanent' : 'temporary',
            attemptCount: totalAttempts
        });
        
        logger.suspiciousActivity('ip_banned', identifier, {
            attemptCount: totalAttempts,
            banType: banDuration === Infinity ? 'permanent' : 'temporary',
            banDuration: banDuration === Infinity ? 'permanent' : `${BAN_DURATION / 60000} minutes`
        });
        
        return true; // Banned
    }
    
    return false; // Not banned yet
};

/**
 * Reset failed attempts (call on successful login)
 */
const resetAttempts = (identifier) => {
    failedAttempts.delete(identifier);
    logger.authSuccess(identifier, identifier, {
        action: 'attempts_reset'
    });
};

/**
 * Check if IP is banned
 */
const isBanned = (identifier) => {
    if (!bannedIPs.has(identifier)) {
        return false;
    }
    
    const ban = bannedIPs.get(identifier);
    const now = Date.now();
    
    // Check if permanent ban
    if (ban.duration === Infinity) {
        return true;
    }
    
    // Check if temporary ban expired
    if (now - ban.bannedAt > ban.duration) {
        bannedIPs.delete(identifier);
        logger.authSuccess(identifier, identifier, {
            action: 'ban_expired'
        });
        return false;
    }
    
    return true;
};

/**
 * Get remaining attempts
 */
const getRemainingAttempts = (identifier) => {
    if (!failedAttempts.has(identifier)) {
        return MAX_ATTEMPTS;
    }
    
    const attempts = failedAttempts.get(identifier);
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < ATTEMPT_WINDOW);
    
    return Math.max(0, MAX_ATTEMPTS - recentAttempts.length);
};

/**
 * Middleware to check if IP is banned
 */
const checkBan = (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    
    if (isBanned(identifier)) {
        const ban = bannedIPs.get(identifier);
        
        logger.suspiciousActivity('banned_ip_attempt', identifier, {
            endpoint: req.originalUrl,
            banReason: ban.reason,
            attemptCount: ban.attemptCount
        });
        
        return res.status(403).json({
            success: false,
            error: 'Access denied',
            message: ban.reason === 'permanent' ? 
                'Your IP has been permanently banned due to multiple failed login attempts' :
                'Your IP has been temporarily banned. Please try again later',
            bannedUntil: ban.duration === Infinity ? 
                'permanent' : 
                new Date(ban.bannedAt + ban.duration).toISOString()
        });
    }
    
    next();
};

/**
 * Get ban statistics
 */
const getStats = () => {
    const now = Date.now();
    const activeBans = Array.from(bannedIPs.entries())
        .filter(([_, ban]) => {
            if (ban.duration === Infinity) return true;
            return now - ban.bannedAt < ban.duration;
        });
    
    const temporaryBans = activeBans.filter(([_, ban]) => ban.duration !== Infinity);
    const permanentBans = activeBans.filter(([_, ban]) => ban.duration === Infinity);
    
    return {
        totalBannedIPs: activeBans.length,
        temporaryBans: temporaryBans.length,
        permanentBans: permanentBans.length,
        activeAttemptTracking: failedAttempts.size,
        bannedIPs: activeBans.map(([ip, ban]) => ({
            ip,
            banType: ban.reason,
            bannedAt: new Date(ban.bannedAt).toISOString(),
            expiresAt: ban.duration === Infinity ? 
                'never' : 
                new Date(ban.bannedAt + ban.duration).toISOString()
        }))
    };
};

/**
 * Manually unban an IP (admin function)
 */
const unbanIP = (identifier) => {
    if (bannedIPs.has(identifier)) {
        bannedIPs.delete(identifier);
        failedAttempts.delete(identifier);
        logger.authSuccess(identifier, 'admin', {
            action: 'manual_unban'
        });
        return true;
    }
    return false;
};

// Cleanup old entries periodically (every 1 hour)
setInterval(() => {
    const now = Date.now();
    
    // Clean up old failed attempts
    for (const [identifier, attempts] of failedAttempts.entries()) {
        const recentAttempts = attempts.filter(time => now - time < ATTEMPT_WINDOW);
        if (recentAttempts.length === 0) {
            failedAttempts.delete(identifier);
        } else {
            failedAttempts.set(identifier, recentAttempts);
        }
    }
    
    // Clean up expired temporary bans
    for (const [identifier, ban] of bannedIPs.entries()) {
        if (ban.duration !== Infinity && now - ban.bannedAt > ban.duration) {
            bannedIPs.delete(identifier);
        }
    }
    
    console.log('🧹 Brute force protection: Cleaned up old entries');
}, 60 * 60 * 1000); // 1 hour

module.exports = {
    trackFailedAttempt,
    resetAttempts,
    isBanned,
    getRemainingAttempts,
    checkBan,
    getStats,
    unbanIP,
    MAX_ATTEMPTS,
    ATTEMPT_WINDOW,
    BAN_DURATION
};
