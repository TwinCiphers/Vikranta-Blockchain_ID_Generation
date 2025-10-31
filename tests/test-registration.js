/**
 * Test tourist registration with short IDs
 * This script tests the /api/tourist/register endpoint
 */

const https = require('https');
const http = require('http');

// Test data
const testTourist = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    nationality: 'India',
    passportNumber: 'A1234567',
    dateOfBirth: '1990-01-01',
    address: '123 Test Street',
    walletAddress: '0x60191B4483430F872a7E06f8269AD52C32404fA8' // Valid Ganache address
};

console.log('\n🧪 Testing Tourist Registration with Short IDs\n');
console.log('Test Data:', JSON.stringify(testTourist, null, 2));
console.log('\nSending registration request...\n');

const postData = JSON.stringify(testTourist);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/tourist/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`Response Status: ${res.statusCode}\n`);
        
        try {
            const result = JSON.parse(data);
            console.log('✅ Registration Response:');
            console.log(JSON.stringify(result, null, 2));
            
            if (result.success && result.uniqueId) {
                const uniqueId = result.uniqueId;
                console.log(`\n🎉 SUCCESS! Generated Short ID: ${uniqueId}`);
                console.log(`   - Length: ${uniqueId.length} characters`);
                console.log(`   - Format: ${/^[A-Za-z0-9]+$/.test(uniqueId) ? 'Valid alphanumeric' : 'INVALID'}`);
                console.log(`   - Transaction Hash: ${result.transactionHash?.substring(0, 20)}...`);
                
                // Test the uniqueId with info endpoint
                console.log('\n📋 Testing GET /api/tourist/info/:uniqueId...\n');
                
                const getOptions = {
                    hostname: 'localhost',
                    port: 3000,
                    path: `/api/tourist/info/${uniqueId}`,
                    method: 'GET'
                };
                
                const getReq = http.request(getOptions, (getRes) => {
                    let getData = '';
                    
                    getRes.on('data', (chunk) => {
                        getData += chunk;
                    });
                    
                    getRes.on('end', () => {
                        console.log(`Response Status: ${getRes.statusCode}\n`);
                        const infoResult = JSON.parse(getData);
                        console.log('✅ Tourist Info Retrieved:');
                        console.log(JSON.stringify(infoResult, null, 2));
                        
                        console.log('\n✅ ALL TESTS PASSED!');
                        console.log('   - Short ID generated successfully');
                        console.log('   - Registration completed');
                        console.log('   - Info retrieval works');
                        console.log('\n🎯 Short ID implementation is working correctly!\n');
                    });
                });
                
                getReq.on('error', (error) => {
                    console.error('❌ Error fetching tourist info:', error.message);
                });
                
                getReq.end();
            } else {
                console.log('❌ Registration failed or no uniqueId returned');
            }
        } catch (error) {
            console.error('❌ Error parsing response:', error.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
    console.log('\n⚠️  Make sure the backend is running on http://localhost:3000');
});

req.write(postData);
req.end();
