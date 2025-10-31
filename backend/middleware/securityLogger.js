// Security Audit Logger - Monitors and logs security events
const fs = require('fs');
const path = require('path');

class SecurityLogger {
    constructor() {
        this.logFile = path.join(__dirname, '../../logs/security.log');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(level, event, details = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            event,
            ...details
        };

        const logLine = JSON.stringify(logEntry) + '\n';

        // Append to file
        fs.appendFile(this.logFile, logLine, (err) => {
            if (err) console.error('Failed to write security log:', err);
        });

        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[SECURITY ${level}]`, event, details);
        }
    }

    // Security event types
    rateLimit(ip, endpoint) {
        this.log('WARNING', 'RATE_LIMIT_EXCEEDED', { ip, endpoint });
    }

    corsViolation(origin, endpoint) {
        this.log('WARNING', 'CORS_VIOLATION', { origin, endpoint });
    }

    invalidInput(ip, endpoint, field) {
        this.log('WARNING', 'INVALID_INPUT', { ip, endpoint, field });
    }

    suspiciousActivity(ip, endpoint, reason) {
        this.log('ALERT', 'SUSPICIOUS_ACTIVITY', { ip, endpoint, reason });
    }

    authFailure(ip, uniqueId) {
        this.log('WARNING', 'AUTH_FAILURE', { ip, uniqueId });
    }

    authSuccess(ip, uniqueId) {
        this.log('INFO', 'AUTH_SUCCESS', { ip, uniqueId });
    }

    dataAccess(ip, uniqueId, resource) {
        this.log('INFO', 'DATA_ACCESS', { ip, uniqueId, resource });
    }

    dataModification(ip, uniqueId, action) {
        this.log('ALERT', 'DATA_MODIFICATION', { ip, uniqueId, action });
    }

    blockchainTransaction(ip, uniqueId, txHash) {
        this.log('INFO', 'BLOCKCHAIN_TX', { ip, uniqueId, txHash });
    }

    systemEvent(event, details) {
        this.log('INFO', 'SYSTEM_EVENT', { event, ...details });
    }
}

// Singleton instance
const securityLogger = new SecurityLogger();

module.exports = securityLogger;
