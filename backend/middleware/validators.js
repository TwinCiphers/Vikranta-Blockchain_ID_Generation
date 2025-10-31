const { body, param, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// Tourist registration validation
const validateRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must contain only letters and spaces (2-100 characters)'),
    body('nationality')
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Nationality must contain only letters'),
    body('passportNumber')
        .optional()
        .trim()
        .isLength({ min: 6, max: 20 })
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Passport number must be 6-20 characters (letters and numbers only)'),
    validate
];

// Unique ID validation (short alphanumeric IDs: 7-10 chars)
const validateUUID = [
    param('uniqueId')
        .matches(/^[A-Za-z0-9]{7,10}$/)
        .withMessage('Invalid unique ID format - expected 7 to 10 alphanumeric characters'),
    validate
];

// QR hash validation
const validateQRHash = [
    param('qrHash')
        .isLength({ min: 64, max: 64 })
        .matches(/^[a-f0-9]{64}$/)
        .withMessage('Invalid QR hash format'),
    validate
];

// Email validation (optional)
const validateEmail = [
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    validate
];

// Phone validation (optional)
const validatePhone = [
    body('phone')
        .optional()
        .matches(/^[0-9+\-\s()]{10,20}$/)
        .withMessage('Invalid phone number format'),
    validate
];

module.exports = { 
    validateRegistration, 
    validateUUID, 
    validateQRHash,
    validateEmail,
    validatePhone,
    validate 
};
