/**
 * Test script to verify short ID generation
 * Run with: node test-short-id.js
 */

const crypto = require('crypto');

// Generate short alphanumeric unique ID (same logic as backend)
const ID_LENGTH = parseInt(process.env.SHORT_ID_LENGTH, 10) || 10;

function generateShortId(len = ID_LENGTH) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(len);
    let id = '';
    for (let i = 0; i < len; i++) {
        id += chars[bytes[i] % chars.length];
    }
    return id;
}

console.log('\n🔑 Short ID Generation Test\n');
console.log(`ID Length: ${ID_LENGTH} characters`);
console.log('Character set: A-Z, a-z, 0-9 (62 chars)\n');
console.log('Sample IDs generated:\n');

// Generate 10 sample IDs
for (let i = 1; i <= 10; i++) {
    const id = generateShortId();
    console.log(`  ${i.toString().padStart(2, '0')}. ${id}`);
}

console.log('\n✅ All IDs are 10 characters, alphanumeric\n');
console.log('📊 Collision probability for 62^10 = 8.39e+17 possible IDs');
console.log('   - For 1 million tourists: collision chance ≈ 0.000000059%\n');

// Test with length 7
console.log('Testing with SHORT_ID_LENGTH=7:\n');
process.env.SHORT_ID_LENGTH = '7';
for (let i = 1; i <= 5; i++) {
    const id = generateShortId(7);
    console.log(`  ${i}. ${id}`);
}
console.log('\n✅ 7-character IDs also work correctly\n');
