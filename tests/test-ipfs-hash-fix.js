const { uploadToIPFS } = require('../backend/config/ipfs');

async function testIPFSHashGeneration() {
    console.log('='.repeat(70));
    console.log('🧪 Testing IPFS Hash Generation');
    console.log('='.repeat(70));
    console.log('');
    
    // Create a test file buffer
    const testData = Buffer.from('This is a test document for IPFS upload');
    
    console.log('📤 Uploading test file to IPFS...');
    console.log('');
    
    try {
        const hash = await uploadToIPFS(testData);
        
        console.log('✅ Upload Complete!');
        console.log('');
        console.log('📊 Hash Details:');
        console.log('   IPFS Hash:', hash);
        console.log('   Length:', hash.length, 'characters');
        console.log('   Format:', hash.startsWith('Qm') ? '✅ Valid CIDv0' : '❌ Invalid');
        console.log('   Expected:', '46 characters');
        console.log('   Status:', hash.length === 46 ? '✅ CORRECT LENGTH' : '❌ INCORRECT LENGTH');
        console.log('');
        
        if (hash.length === 46) {
            console.log('🎉 SUCCESS! Mock IPFS hash generation is working correctly!');
            console.log('');
            console.log('📝 Example IPFS URLs:');
            console.log(`   https://ipfs.io/ipfs/${hash}`);
            console.log(`   https://gateway.pinata.cloud/ipfs/${hash}`);
            console.log(`   https://cloudflare-ipfs.com/ipfs/${hash}`);
        } else {
            console.log('❌ FAILED! Hash length is incorrect.');
            console.log(`   Got ${hash.length} characters, expected 46`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    
    console.log('');
    console.log('='.repeat(70));
}

testIPFSHashGeneration();
