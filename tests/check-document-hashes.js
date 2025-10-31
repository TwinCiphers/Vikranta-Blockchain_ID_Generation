const { touristRegistryContract } = require('../backend/config/blockchain');

async function checkDocumentHashes() {
    try {
        const uniqueId = 'EJ6mrfQ5fy'; // Your test tourist
        console.log('Checking documents for:', uniqueId);
        console.log('='.repeat(60));
        
        const docs = await touristRegistryContract.methods
            .getTouristDocuments(uniqueId)
            .call();
        
        console.log('\nDocuments found:', docs.length);
        console.log('');
        
        docs.forEach((doc, index) => {
            console.log(`📄 Document ${index + 1}:`);
            console.log('   Type:', doc.documentType);
            console.log('   IPFS Hash:', doc.ipfsHash);
            console.log('   Hash Length:', doc.ipfsHash.length, 'characters');
            console.log('   Upload Date:', new Date(Number(doc.uploadDate) * 1000).toLocaleString());
            console.log('   Verified:', doc.isVerified ? '✅ Yes' : '❌ No');
            console.log('   Status:', doc.ipfsHash.length === 46 ? '✅ Valid length' : '⚠️ TRUNCATED!');
            console.log('');
        });
        
        console.log('='.repeat(60));
        console.log('\n💡 Valid IPFS (CIDv0) hashes should be exactly 46 characters long');
        console.log('   Example: QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDocumentHashes();
