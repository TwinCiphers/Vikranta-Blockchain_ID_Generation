const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate QR code for tourist verification with professional data structure
 * @param {string} uniqueId - Tourist's unique identifier
 * @param {Object} touristData - Tourist data including name, nationality, expiration
 * @returns {Promise<string>} - QR code as data URL
 */
async function generateQRCode(uniqueId, touristData = null) {
    try {
        // Professional QR code data structure
        const qrData = {
            // ISO 8601 standard
            version: '1.0',
            standard: 'BLOCKCHAIN-TOURIST-ID',
            
            // Tourist Identification
            touristId: uniqueId,
            qrCodeHash: touristData?.qrCodeHash || uniqueId.substring(0, 16),
            
            // Personal Information (if available)
            ...(touristData?.name && { fullName: touristData.name }),
            ...(touristData?.nationality && { nationality: touristData.nationality }),
            
            // Verification Details
            issueDate: touristData?.verificationDate 
                ? new Date(touristData.verificationDate * 1000).toISOString()
                : new Date().toISOString(),
            expirationDate: touristData?.expirationDate 
                ? new Date(touristData.expirationDate * 1000).toISOString()
                : null,
            
            // Authority Information
            issuingAuthority: 'VIKRANTA Tourism Department',
            countryCode: 'IND', // Replace with actual country code
            
            // Verification Endpoint
            verificationUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/verify/${touristData?.qrCodeHash || uniqueId}`,
            
            // Security
            generatedAt: new Date().toISOString(),
            checksum: null // Will be calculated below
        };
        
        // Generate checksum for integrity verification
        const checksumData = `${qrData.touristId}:${qrData.issueDate}:${qrData.expirationDate}`;
        qrData.checksum = crypto.createHash('sha256').update(checksumData).digest('hex').substring(0, 16);

        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
            errorCorrectionLevel: 'H', // High error correction for damaged codes
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw error;
    }
}

/**
 * Generate QR code as buffer for PVC cards
 * @param {string} uniqueId - Tourist's unique identifier
 * @param {Object} touristData - Tourist data including name, nationality, expiration
 * @returns {Promise<Buffer>} - QR code as buffer
 */
async function generateQRCodeBuffer(uniqueId, touristData = null) {
    try {
        // Professional QR code data structure
        const qrData = {
            // ISO 8601 standard
            version: '1.0',
            standard: 'BLOCKCHAIN-TOURIST-ID',
            
            // Tourist Identification
            touristId: uniqueId,
            qrCodeHash: touristData?.qrCodeHash || uniqueId.substring(0, 16),
            
            // Personal Information (if available)
            ...(touristData?.name && { fullName: touristData.name }),
            ...(touristData?.nationality && { nationality: touristData.nationality }),
            
            // Verification Details
            issueDate: touristData?.verificationDate 
                ? new Date(touristData.verificationDate * 1000).toISOString()
                : new Date().toISOString(),
            expirationDate: touristData?.expirationDate 
                ? new Date(touristData.expirationDate * 1000).toISOString()
                : null,
            
            // Authority Information
            issuingAuthority: 'VIKRANTA Tourism Department',
            countryCode: '+91', // Replace with actual country code
            
            // Verification Endpoint
            verificationUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/verify/${touristData?.qrCodeHash || uniqueId}`,
            
            // Security
            generatedAt: new Date().toISOString(),
            checksum: null // Will be calculated below
        };
        
        // Generate checksum for integrity verification
        const checksumData = `${qrData.touristId}:${qrData.issueDate}:${qrData.expirationDate}`;
        qrData.checksum = crypto.createHash('sha256').update(checksumData).digest('hex').substring(0, 16);

        const buffer = await QRCode.toBuffer(JSON.stringify(qrData), {
            errorCorrectionLevel: 'H', // High error correction for damaged codes
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return buffer;
    } catch (error) {
        console.error('QR Code buffer generation error:', error);
        throw error;
    }
}

module.exports = {
    generateQRCode,
    generateQRCodeBuffer
};
