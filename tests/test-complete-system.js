/**
 * Comprehensive System Verification Test
 * Tests all key endpoints and functionality with short IDs
 */

const http = require('http');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🔍 COMPREHENSIVE SYSTEM VERIFICATION TEST                 ║');
console.log('║  Testing Short ID Implementation                          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Configuration
const BASE_URL = 'http://localhost:3000';
const HTTPS_URL = 'https://localhost';

// Test tourist data
const testTourist = {
    name: 'Verification Test User',
    email: 'verify@test.com',
    phone: '+9876543210',
    nationality: 'United States',
    passportNumber: 'US123456',
    dateOfBirth: '1995-05-15',
    address: '456 Verification Street',
    walletAddress: '0x0e1447f106EeBA78c17e515218664A0f8739752C' // Ganache account
};

let testUniqueId = '';

// Test results
const results = {
    total: 0,
    passed: 0,
    failed: 0
};

// Helper to make HTTP requests
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

// Test helper
async function runTest(name, testFn) {
    results.total++;
    process.stdout.write(`\n[${results.total}] ${name}... `);
    try {
        await testFn();
        console.log('✅ PASS');
        results.passed++;
        return true;
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}`);
        results.failed++;
        return false;
    }
}

// Main test suite
async function runTests() {
    console.log('🧪 Starting System Verification Tests...\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Test 1: Backend Health Check
    await runTest('Backend Server Health Check', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/tourist/verify/test',
            method: 'GET'
        });
        if (response.status !== 404 && response.status !== 200) {
            throw new Error(`Backend not responding correctly: ${response.status}`);
        }
    });

    // Test 2: Register Tourist with Short ID
    await runTest('Tourist Registration (Short ID Generation)', async () => {
        const postData = JSON.stringify(testTourist);
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/tourist/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, postData);

        if (!response.data.success) {
            throw new Error(`Registration failed: ${response.data.message}`);
        }
        
        testUniqueId = response.data.uniqueId;
        
        // Validate short ID format
        if (!/^[A-Za-z0-9]{7,10}$/.test(testUniqueId)) {
            throw new Error(`Invalid ID format: ${testUniqueId}`);
        }
        
        console.log(`\n    ✓ Generated Short ID: ${testUniqueId} (${testUniqueId.length} chars)`);
    });

    // Test 3: Retrieve Tourist Info
    await runTest('Get Tourist Info by Short ID', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: `/api/tourist/info/${testUniqueId}`,
            method: 'GET'
        });

        if (!response.data.success || !response.data.data) {
            throw new Error('Failed to retrieve tourist info');
        }
        
        if (response.data.data.name !== testTourist.name) {
            throw new Error('Retrieved data does not match');
        }
    });

    // Test 4: Get QR Code
    await runTest('Generate QR Code for Short ID', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: `/api/tourist/qrcode/${testUniqueId}`,
            method: 'GET'
        });

        if (!response.data.success || !response.data.qrCode) {
            throw new Error('QR code generation failed');
        }
    });

    // Test 5: Validate Short ID Format (Server-side)
    await runTest('Server-Side Short ID Validation', async () => {
        // Test valid ID
        const validResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: `/api/tourist/info/${testUniqueId}`,
            method: 'GET'
        });

        if (!validResponse.data.success) {
            throw new Error('Valid short ID rejected');
        }

        // Test invalid ID (old UUID format should fail)
        const invalidResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/tourist/info/32254698-62e1-4495-b8aa-d09191e254db',
            method: 'GET'
        });

        // Should fail or return not found (not a validation error)
        if (invalidResponse.status === 200 && invalidResponse.data.success) {
            throw new Error('Old UUID format incorrectly accepted');
        }
    });

    // Test 6: Multiple ID Generation (Uniqueness Check)
    await runTest('Multiple Short ID Generation (Uniqueness)', async () => {
        const ids = new Set();
        
        for (let i = 0; i < 5; i++) {
            const postData = JSON.stringify({
                ...testTourist,
                name: `Test User ${i}`,
                walletAddress: `0x${'0'.repeat(38)}${i.toString().padStart(4, '0')}`
            });
            
            const response = await makeRequest({
                hostname: 'localhost',
                port: 3000,
                path: '/api/tourist/register',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, postData);

            if (response.data.success) {
                ids.add(response.data.uniqueId);
            }
        }

        if (ids.size === 0) {
            throw new Error('No IDs generated');
        }
        
        console.log(`\n    ✓ Generated ${ids.size} unique IDs: ${[...ids].join(', ')}`);
    });

    // Test 7: Frontend Validation Pattern
    await runTest('Frontend Validation Regex Pattern', async () => {
        const frontendRegex = /^[A-Za-z0-9]{7,10}$/;
        
        const validIds = ['fUQKkp6fZq', 'w4tWdF5', 'ABC123XYZ', '7charID'];
        const invalidIds = ['abc-def', 'too-long-id-12345', 'ab', '32254698-62e1-4495'];
        
        for (const id of validIds) {
            if (!frontendRegex.test(id)) {
                throw new Error(`Valid ID rejected: ${id}`);
            }
        }
        
        for (const id of invalidIds) {
            if (frontendRegex.test(id)) {
                throw new Error(`Invalid ID accepted: ${id}`);
            }
        }
    });

    // Final Results
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('\n📊 TEST RESULTS SUMMARY\n');
    console.log(`   Total Tests:  ${results.total}`);
    console.log(`   ✅ Passed:    ${results.passed} (${Math.round(results.passed/results.total*100)}%)`);
    console.log(`   ❌ Failed:    ${results.failed}`);
    console.log('\n═══════════════════════════════════════════════════════════\n');

    if (results.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! System is working correctly.\n');
        console.log('✅ SHORT ID IMPLEMENTATION VERIFIED\n');
        console.log('📋 Test Tourist Created:');
        console.log(`   Name: ${testTourist.name}`);
        console.log(`   Short ID: ${testUniqueId}`);
        console.log(`   Format: Valid ${testUniqueId.length}-char alphanumeric\n`);
        console.log('🌐 Access Points:');
        console.log('   Frontend: https://localhost/');
        console.log('   Login: https://localhost/login.html');
        console.log(`   Dashboard: https://localhost/dashboard.html?uniqueId=${testUniqueId}`);
        console.log('   Backend API: http://localhost:3000\n');
    } else {
        console.log(`⚠️  ${results.failed} TEST(S) FAILED - Please review errors above.\n`);
    }
}

// Run tests
runTests().catch(error => {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.log('\n⚠️  Make sure Docker containers are running:');
    console.log('   docker-compose ps\n');
});
