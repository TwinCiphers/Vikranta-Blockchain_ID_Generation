#!/usr/bin/env node

/**
 * Generate secure keys for .env configuration
 * Run: node generate-keys.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Keys for your .env file\n');
console.log('=' .repeat(60));

// Generate ENCRYPTION_KEY (32 bytes = 64 hex characters)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('\n📌 ENCRYPTION_KEY (32 bytes):');
console.log(encryptionKey);

// Generate JWT_SECRET (64 bytes = 128 hex characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📌 JWT_SECRET (64 bytes):');
console.log(jwtSecret);

// Generate a sample UUID for testing
const uuid = crypto.randomUUID();
console.log('\n📌 Sample UUID (for testing):');
console.log(uuid);

console.log('\n' + '=' .repeat(60));
console.log('\n✅ Copy these values to your .env file');
console.log('⚠️  IMPORTANT: Keep these keys secret and never commit to Git!\n');

// Create a template
console.log('📋 Add these to your .env file:\n');
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\n');
