// Get unique ID from URL
const urlParams = new URLSearchParams(window.location.search);
const uniqueId = urlParams.get('uniqueId');

if (!uniqueId) {
    alert('⚠️ No unique ID found.\n\nPlease register first or check your URL.');
    window.location.href = 'register.html';
}

// Display unique ID
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard loading for uniqueId:', uniqueId);
    
    // Show loading message
    const profileInfo = document.getElementById('profileInfo');
    if (profileInfo) {
        profileInfo.innerHTML = '<p>Loading profile...</p>';
    }
    
    await loadProfile();
    setupEventListeners();
});

async function loadProfile() {
    try {
        console.log('Loading profile for uniqueId:', uniqueId);
        
        const response = await fetch(`/api/tourist/info/${uniqueId}`);
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Profile data:', result);
        
        if (result.success) {
            displayProfile(result.data);
            loadDocuments(); // Also load documents
        } else {
            showError('❌ Failed to load profile: ' + (result.message || 'Unknown error') + 
                '\n\nThis tourist ID may not exist in the current contract.\nPlease register again.');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('❌ Error loading profile: ' + error.message + 
            '\n\n⚠️ The tourist ID you are trying to access does not exist in the blockchain.\n\n' +
            'This happens when:\n' +
            '1. The contract was redeployed (old data is lost)\n' +
            '2. The tourist was never registered\n' +
            '3. There is a network error\n\n' +
            '👉 Please register a new tourist to continue.');
    }
}

function displayProfile(data) {
    const profileInfo = document.getElementById('profileInfo');
    
    // Check if expired
    const now = Date.now() / 1000; // Current time in seconds
    const isExpired = data.expirationDate && data.expirationDate > 0 && now >= data.expirationDate;
    const isValid = data.isVerified && data.isActive && !isExpired;
    
    let statusText = '⏳ Pending Verification';
    let statusColor = 'orange';
    
    if (data.isVerified) {
        if (isExpired) {
            statusText = '❌ Expired';
            statusColor = 'red';
        } else if (isValid) {
            statusText = '✅ Verified & Active';
            statusColor = 'green';
        } else if (!data.isActive) {
            statusText = '⚠️ Inactive';
            statusColor = 'red';
        }
    }
    
    let expirationInfo = '';
    if (data.verificationDate && data.verificationDate > 0) {
        expirationInfo = `
            <p><strong>Verification Date:</strong> ${new Date(data.verificationDate * 1000).toLocaleDateString()}</p>
        `;
    }
    
    if (data.expirationDate && data.expirationDate > 0) {
        const expirationDate = new Date(data.expirationDate * 1000);
        const daysRemaining = Math.floor((data.expirationDate - now) / 86400);
        
        expirationInfo += `
            <p><strong>Expiration Date:</strong> ${expirationDate.toLocaleDateString()}</p>
            <p><strong>Days Remaining:</strong> ${isExpired ? 'EXPIRED' : daysRemaining + ' days'}</p>
        `;
    }
    
    profileInfo.innerHTML = `
        <p><strong>Unique ID:</strong> ${uniqueId}</p>
        <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
        <p><strong>Nationality:</strong> ${data.nationality || 'N/A'}</p>
        <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
        <p><strong>Registration Date:</strong> ${data.registrationDate ? new Date(data.registrationDate * 1000).toLocaleDateString() : 'N/A'}</p>
        ${expirationInfo}
    `;
    
    if (isValid) {
        // Fetch and display QR code
        loadQRCode();
    }
}

async function loadQRCode() {
    try {
        const response = await fetch(`/api/tourist/qrcode/${uniqueId}`);
        const result = await response.json();
        
        if (result.success && result.qrCode) {
            document.getElementById('qrSection').style.display = 'block';
            document.getElementById('qrDisplay').innerHTML = `<img src="${result.qrCode}" alt="QR Code" style="max-width: 300px;">`;
        }
    } catch (error) {
        console.error('Error loading QR code:', error);
    }
}

function setupEventListeners() {
    // Document upload form
    document.getElementById('documentUploadForm').addEventListener('submit', handleDocumentUpload);
    
    // Disconnect button
    document.getElementById('disconnectBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Download PVC card button
    const downloadBtn = document.getElementById('downloadPVC');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPVCCard);
    }
}

async function handleDocumentUpload(e) {
    e.preventDefault();
    
    const documentType = document.getElementById('documentType').value;
    const documentFile = document.getElementById('documentFile').files[0];
    
    if (!documentFile) {
        alert('Please select a file to upload');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    
    try {
        console.log('Uploading document:', { uniqueId, documentType, fileName: documentFile.name });
        
        // Create FormData
        const formData = new FormData();
        formData.append('uniqueId', uniqueId);
        formData.append('documentType', documentType);
        formData.append('document', documentFile);
        
        console.log('Sending to:', '/api/tourist/upload-document');
        
        // Upload document
        const response = await fetch('/api/tourist/upload-document', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            alert('✅ Document uploaded successfully!');
            document.getElementById('documentFile').value = '';
            loadDocuments();
        } else {
            alert('❌ Upload failed: ' + (result.message || 'Unknown error'));
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('❌ Upload failed: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload';
    }
}

async function loadDocuments() {
    try {
        const response = await fetch(`/api/tourist/documents/${uniqueId}`);
        const result = await response.json();
        
        if (result.success && result.documents) {
            displayDocuments(result.documents);
        }
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

function displayDocuments(documents) {
    const listing = document.getElementById('documentsListing');
    
    if (!documents || documents.length === 0) {
        listing.innerHTML = '<p>No documents uploaded yet.</p>';
        return;
    }
    
    listing.innerHTML = '<h3>Uploaded Documents</h3>' + documents.map((doc, index) => `
        <div class="document-item">
            <p><strong>${doc.documentType}</strong></p>
            <p>IPFS Hash: ${doc.ipfsHash}</p>
            <p>Status: ${doc.isVerified ? '✅ Verified' : '⏳ Pending'}</p>
            <p>Upload Date: ${new Date(doc.uploadDate * 1000).toLocaleDateString()}</p>
        </div>
    `).join('');
}

async function downloadPVCCard() {
    try {
        console.log('Downloading PVC card for:', uniqueId);
        
        const response = await fetch(`/api/tourist/pvc-card/${uniqueId}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to download PVC card');
        }
        
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Tourist_Card_${uniqueId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('PVC card downloaded successfully');
    } catch (error) {
        console.error('Error downloading PVC card:', error);
        alert('❌ Failed to download PVC card: ' + error.message);
    }
}

function showError(message) {
    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `
        <div style="padding: 20px; background: #fee; border: 2px solid #f00; border-radius: 8px;">
            <h3 style="color: #c00; margin-top: 0;">⚠️ Error</h3>
            <p style="white-space: pre-line; color: #333;">${message}</p>
            <button onclick="window.location.href='register.html'" style="margin-top: 15px; padding: 10px 20px; background: #1e3a8a; color: white; border: none; border-radius: 5px; cursor: pointer;">
                ← Register New Tourist
            </button>
        </div>
    `;
}
