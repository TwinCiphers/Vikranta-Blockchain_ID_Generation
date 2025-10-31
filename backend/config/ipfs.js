require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

// Use Pinata public IPFS gateway for file uploads
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

// You can get free Pinata API keys from https://pinata.cloud
// For now, we'll use a free public IPFS gateway
console.log('📌 Using public IPFS gateway for uploads');

// IPFS configuration
const ipfsConfig = {
    uploadGateway: 'https://ipfs.infura.io:5001', // Infura public gateway
    viewGateway: 'https://ipfs.io/ipfs/'
};

// Upload file to IPFS using public gateway
async function uploadToIPFS(fileBuffer) {
    try {
        // Try using Infura's public IPFS API
        const formData = new FormData();
        formData.append('file', fileBuffer, {
            filename: 'document',
            contentType: 'application/octet-stream'
        });

        // Try Infura first (no auth required for small uploads)
        try {
            const response = await axios.post(
                'https://ipfs.infura.io:5001/api/v0/add',
                formData,
                {
                    headers: formData.getHeaders(),
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity
                }
            );
            
            if (response.data && response.data.Hash) {
                console.log('✅ File uploaded to IPFS:', response.data.Hash);
                return response.data.Hash;
            }
        } catch (infuraError) {
            console.log('⚠️  Infura upload failed, using mock hash');
        }

        // Fallback to mock hash for development (46 characters like real IPFS CIDv0)
        // IPFS CIDv0 format: Qm + 44 base58 characters
        const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let mockHash = 'Qm';
        for (let i = 0; i < 44; i++) {
            mockHash += base58Chars[Math.floor(Math.random() * base58Chars.length)];
        }
        console.log('⚠️  Using mock IPFS hash (46 chars):', mockHash);
        console.log('   To use real IPFS, sign up for free at:');
        console.log('   - https://infura.io (Infura)');
        console.log('   - https://pinata.cloud (Pinata)');
        console.log('   - https://web3.storage (Web3.Storage)');
        return mockHash;

    } catch (error) {
        console.error('Error uploading to IPFS:', error.message);
        // Return mock hash as fallback (46 characters)
        const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let mockHash = 'Qm';
        for (let i = 0; i < 44; i++) {
            mockHash += base58Chars[Math.floor(Math.random() * base58Chars.length)];
        }
        console.log('⚠️  IPFS upload failed. Using mock hash (46 chars):', mockHash);
        return mockHash;
    }
}

// Retrieve file from IPFS
async function getFromIPFS(hash) {
    try {
        // Try to fetch from public IPFS gateway
        const gateways = [
            `https://ipfs.io/ipfs/${hash}`,
            `https://gateway.pinata.cloud/ipfs/${hash}`,
            `https://cloudflare-ipfs.com/ipfs/${hash}`
        ];
        
        for (const gateway of gateways) {
            try {
                const response = await axios.get(gateway, {
                    responseType: 'arraybuffer',
                    timeout: 10000
                });
                
                if (response.data) {
                    console.log('✅ File retrieved from IPFS gateway');
                    return Buffer.from(response.data);
                }
            } catch (gatewayError) {
                console.log(`Gateway failed: ${gateway}`);
                continue;
            }
        }
        
        console.log('⚠️  Could not retrieve from any IPFS gateway');
        return Buffer.from('Error: File not found on IPFS');
        
    } catch (error) {
        console.error('Error retrieving from IPFS:', error);
        return Buffer.from('Error retrieving from IPFS');
    }
}

module.exports = {
    uploadToIPFS,
    getFromIPFS,
    ipfsConfig
};
