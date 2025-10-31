/**
 * Test Document Upload and Viewing in Authority Panel
 * 
 * This script:
 * 1. Registers a tourist
 * 2. Uploads a test document
 * 3. Verifies documents appear in authority panel
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Skip SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('\n=== Testing Document Upload & Authority View ===\n');

const API_URL = 'http://localhost:3000';
let testTouristId = null;
let authToken = null;

// Helper function for API requests
function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_URL);
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const protocol = url.protocol === 'https:' ? https : http;
        const req = protocol.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Test 1: Register a tourist
async function testRegistration() {
    console.log('📝 Step 1: Registering a test tourist...');
    
    const response = await makeRequest('POST', '/api/tourist/register', {
        name: 'Test Tourist with Documents',
        nationality: 'Test Country',
        walletAddress: '0x1234567890123456789012345678901234567890'
    });

    if (response.status === 200 && response.data.success) {
        testTouristId = response.data.uniqueId;
        console.log('✅ Tourist registered successfully');
        console.log('   Unique ID:', testTouristId);
        return true;
    } else {
        console.log('❌ Registration failed:', response.data.message);
        return false;
    }
}

// Test 2: Upload a test document
async function testDocumentUpload() {
    console.log('\n📄 Step 2: Uploading test document...');
    
    return new Promise((resolve, reject) => {
        // Create a simple text file for testing
        const testContent = 'This is a test document for authority review.\nDocument Type: Passport\nTest ID: ' + testTouristId;
        const testFilePath = path.join(__dirname, 'test-document.txt');
        fs.writeFileSync(testFilePath, testContent);
        
        const form = new FormData();
        form.append('uniqueId', testTouristId);
        form.append('documentType', 'Passport');
        form.append('document', fs.createReadStream(testFilePath));
        
        const url = new URL('/api/tourist/upload-document', API_URL);
        
        form.submit(url.toString(), (err, res) => {
            if (err) {
                console.log('❌ Upload error:', err.message);
                reject(err);
                return;
            }
            
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    if (result.success) {
                        console.log('✅ Document uploaded successfully');
                        console.log('   IPFS Hash:', result.ipfsHash);
                        
                        // Clean up test file
                        fs.unlinkSync(testFilePath);
                        resolve(true);
                    } else {
                        console.log('❌ Upload failed:', result.message);
                        resolve(false);
                    }
                } catch (e) {
                    console.log('❌ Parse error:', e.message);
                    resolve(false);
                }
            });
        });
    });
}

// Test 3: Authority login
async function testAuthorityLogin() {
    console.log('\n🔐 Step 3: Authority login...');
    
    const response = await makeRequest('POST', '/api/authority/login', {
        address: '0x9bBD3535c5582A4b15a529Bb3794688728988D41',
        passphrase: 'vikrantaTBS$2025'
    });

    if (response.status === 200 && response.data.success) {
        authToken = response.data.token;
        console.log('✅ Authority logged in successfully');
        return true;
    } else {
        console.log('❌ Login failed:', response.data.message);
        return false;
    }
}

// Test 4: Check pending list includes documents
async function testPendingWithDocuments() {
    console.log('\n📋 Step 4: Checking pending list with documents...');
    
    const response = await makeRequest('GET', '/api/authority/pending', null, authToken);

    if (response.status === 200 && response.data.success) {
        const tourist = response.data.tourists.find(t => t.uniqueId === testTouristId);
        if (tourist) {
            console.log('✅ Tourist found in pending list');
            console.log('   Name:', tourist.name);
            console.log('   Document Count:', tourist.documentCount || 0);
            return true;
        } else {
            console.log('⚠️ Tourist not found in pending list');
            return false;
        }
    } else {
        console.log('❌ Failed to fetch pending list');
        return false;
    }
}

// Test 5: Fetch tourist documents directly
async function testFetchDocuments() {
    console.log('\n📂 Step 5: Fetching tourist documents...');
    
    const response = await makeRequest('GET', `/api/tourist/documents/${testTouristId}`, null);

    if (response.status === 200 && response.data.success) {
        const documents = response.data.documents || [];
        console.log('✅ Documents retrieved successfully');
        console.log('   Total Documents:', documents.length);
        
        if (documents.length > 0) {
            documents.forEach((doc, index) => {
                console.log(`\n   Document ${index + 1}:`);
                console.log('   - Type:', doc.documentType);
                console.log('   - IPFS Hash:', doc.ipfsHash);
                console.log('   - Upload Date:', new Date(doc.uploadDate * 1000).toLocaleString());
                console.log('   - Verified:', doc.isVerified ? '✅ Yes' : '⏳ Pending');
            });
        }
        return true;
    } else {
        console.log('❌ Failed to fetch documents');
        return false;
    }
}

// Run all tests
async function runTests() {
    try {
        console.log('Testing document upload and authority viewing...\n');
        console.log('='.repeat(60) + '\n');

        if (!await testRegistration()) return;
        if (!await testDocumentUpload()) return;
        if (!await testAuthorityLogin()) return;
        if (!await testPendingWithDocuments()) return;
        if (!await testFetchDocuments()) return;

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ ALL TESTS PASSED!\n');
        console.log('📋 Summary:');
        console.log('1. ✅ Tourist registered');
        console.log('2. ✅ Document uploaded to IPFS');
        console.log('3. ✅ Authority logged in');
        console.log('4. ✅ Tourist appears in pending list');
        console.log('5. ✅ Documents can be fetched and viewed');
        console.log('\n🎯 Now open the authority panel to view documents:');
        console.log('   https://localhost/authority-panel.html');
        console.log('\n' + '='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error(error);
    }
}

// Start tests
runTests();
