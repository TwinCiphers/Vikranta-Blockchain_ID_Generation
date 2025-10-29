require('dotenv').config();

// Mock IPFS for development (avoiding ipfs-http-client compatibility issues)
let ipfs = null;

// For now, we'll use mock IPFS storage
// You can enable real IPFS later by installing kubo-rpc-client or using local IPFS
console.log('⚠️  Using mock IPFS storage for development');

// IPFS configuration (for future use)
const ipfsConfig = {
    host: process.env.IPFS_HOST || 'localhost',
    port: process.env.IPFS_PORT || 5001,
    protocol: process.env.IPFS_PROTOCOL || 'http'
};

// Upload file to IPFS
async function uploadToIPFS(fileBuffer) {
    try {
        if (!ipfs) {
            // Mock IPFS hash for development
            const mockHash = 'Qm' + require('crypto').randomBytes(22).toString('base64').replace(/[/+=]/g, '');
            console.log('⚠️  Using mock IPFS hash:', mockHash);
            return mockHash;
        }
        const result = await ipfs.add(fileBuffer);
        return result.path; // Returns IPFS hash
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        // Return mock hash as fallback
        const mockHash = 'Qm' + require('crypto').randomBytes(22).toString('base64').replace(/[/+=]/g, '');
        console.log('⚠️  IPFS upload failed. Using mock hash:', mockHash);
        return mockHash;
    }
}

// Retrieve file from IPFS
async function getFromIPFS(hash) {
    try {
        if (!ipfs) {
            console.log('⚠️  IPFS not available. Cannot retrieve file:', hash);
            return Buffer.from('Mock IPFS data - IPFS not configured');
        }
        const chunks = [];
        for await (const chunk of ipfs.cat(hash)) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    } catch (error) {
        console.error('Error retrieving from IPFS:', error);
        return Buffer.from('Error retrieving from IPFS');
    }
}

module.exports = {
    ipfs,
    uploadToIPFS,
    getFromIPFS
};
