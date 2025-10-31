// Sanitize input to prevent XSS attacks
function sanitizeInput(req, res, next) {
    // Function to sanitize strings
    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        
        // Remove potentially dangerous characters and scripts
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    };

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitize(req.body[key]);
            }
        });
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitize(req.query[key]);
            }
        });
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
        Object.keys(req.params).forEach(key => {
            if (typeof req.params[key] === 'string') {
                req.params[key] = sanitize(req.params[key]);
            }
        });
    }

    next();
}

module.exports = sanitizeInput;
