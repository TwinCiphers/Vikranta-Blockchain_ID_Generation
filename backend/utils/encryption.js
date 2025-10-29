const CryptoJS = require('crypto-js');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-change-this';

/**
 * Encrypt data using AES-256
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data
 */
function encrypt(data) {
    try {
        const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
}

/**
 * Decrypt data using AES-256
 * @param {string} encryptedData - Encrypted data
 * @returns {string} - Decrypted data
 */
function decrypt(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
}

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
function hash(data) {
    try {
        const hashed = CryptoJS.SHA256(data).toString();
        return hashed;
    } catch (error) {
        console.error('Hashing error:', error);
        throw error;
    }
}

module.exports = {
    encrypt,
    decrypt,
    hash
};
