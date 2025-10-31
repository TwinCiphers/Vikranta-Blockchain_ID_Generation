let currentTouristId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Display logged-in authority
    const authWallet = sessionStorage.getItem('authorityWallet');
    if (authWallet) {
        console.log('Authority panel loaded for:', authWallet);
        document.getElementById('authorityAddress').textContent = 
            `Logged in: ${authWallet.substring(0, 6)}...${authWallet.substring(38)}`;
    }
    
    await loadPendingVerifications();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('disconnectBtn').addEventListener('click', logout);
    
    document.getElementById('approveBtn').addEventListener('click', () => approveTourist());
    document.getElementById('rejectBtn').addEventListener('click', () => rejectTourist());
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('downloadPvcBtn').addEventListener('click', () => downloadPVCCard());
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session
        sessionStorage.clear();
        
        alert('Logged out successfully');
        window.location.href = 'authority-login.html';
    }
}

async function loadPendingVerifications() {
    try {
        console.log('Loading pending verifications...');
        
        const token = sessionStorage.getItem('authorityToken');
        if (!token) {
            alert('Session expired. Please login again.');
            window.location.href = 'authority-login.html';
            return;
        }
        
        const response = await fetch('/api/authority/pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            alert('Session expired. Please login again.');
            sessionStorage.clear();
            window.location.href = 'authority-login.html';
            return;
        }
        
        const result = await response.json();
        
        console.log('Pending verifications:', result);
        
        if (result.success && result.tourists) {
            displayPendingList(result.tourists);
        } else {
            showMessage('No pending verifications found');
        }
    } catch (error) {
        console.error('Error loading pending verifications:', error);
        showMessage('Error: ' + error.message);
    }
}

function displayPendingList(tourists) {
    const pendingList = document.getElementById('pendingList');
    
    if (!tourists || tourists.length === 0) {
        pendingList.innerHTML = '<p>No pending verifications</p>';
        return;
    }
    
    pendingList.innerHTML = tourists.map(tourist => `
        <div class="pending-item" onclick="viewTourist('${tourist.uniqueId}')">
            <h3>${tourist.name}</h3>
            <p><strong>Nationality:</strong> ${tourist.nationality}</p>
            <p><strong>Unique ID:</strong> ${tourist.uniqueId}</p>
            <p><strong>Registration Date:</strong> ${new Date(tourist.registrationDate * 1000).toLocaleDateString()}</p>
            <p><strong>Documents:</strong> ${tourist.documentCount || 0}</p>
            <button class="btn btn-primary">Review</button>
        </div>
    `).join('');
}

async function viewTourist(uniqueId) {
    currentTouristId = uniqueId;
    
    try {
        console.log('Loading tourist details:', uniqueId);
        
        // Fetch tourist info
        const infoResponse = await fetch(`/api/tourist/info/${uniqueId}`);
        const infoResult = await infoResponse.json();
        
        // Fetch documents
        const docsResponse = await fetch(`/api/tourist/documents/${uniqueId}`);
        const docsResult = await docsResponse.json();
        
        if (infoResult.success) {
            displayTouristDetails(infoResult.data, docsResult.documents || []);
            document.getElementById('verificationModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading tourist:', error);
        alert('Error loading tourist details');
    }
}

function displayTouristDetails(tourist, documents) {
    const detailsDiv = document.getElementById('touristDetails');
    const documentsDiv = document.getElementById('touristDocuments');
    const downloadBtn = document.getElementById('downloadPvcBtn');
    const approveBtn = document.getElementById('approveBtn');
    
    // Show/hide buttons based on verification status
    if (tourist.isVerified) {
        downloadBtn.style.display = 'inline-block';
        approveBtn.style.display = 'none';
    } else {
        downloadBtn.style.display = 'none';
        approveBtn.style.display = 'inline-block';
    }
    
    detailsDiv.innerHTML = `
        <div class="tourist-info">
            <h3>👤 Tourist Information</h3>
            <p><strong>Name:</strong> ${tourist.name}</p>
            <p><strong>Nationality:</strong> ${tourist.nationality}</p>
            <p><strong>Unique ID:</strong> <code>${currentTouristId}</code></p>
            <p><strong>Registration Date:</strong> ${new Date(tourist.registrationDate * 1000).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${tourist.isVerified ? '✅ Verified' : '⏳ Pending'}</p>
        </div>
    `;
    
    documentsDiv.innerHTML = `
        <div class="documents-info">
            <h3>📄 Uploaded Documents (${documents.length})</h3>
            ${documents.length === 0 ? 
                '<p style="color: #999; padding: 20px; text-align: center; background: #f9f9f9; border-radius: 8px;">No documents uploaded yet</p>' :
                documents.map((doc, index) => `
                    <div class="document-item" style="margin-bottom: 15px; padding: 15px; border: 2px solid ${doc.isVerified ? '#28a745' : '#ffc107'}; border-radius: 8px; background: ${doc.isVerified ? '#f0fff4' : '#fffbf0'};">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div style="flex: 1;">
                                <p style="margin: 5px 0;"><strong>📋 Type:</strong> <span style="background: #e3f2fd; padding: 4px 12px; border-radius: 4px; font-weight: 500;">${doc.documentType}</span></p>
                                <p style="margin: 5px 0; font-size: 12px;"><strong>🔗 IPFS Hash:</strong> <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; word-break: break-all;">${doc.ipfsHash}</code></p>
                                <p style="margin: 5px 0;"><strong>📅 Upload Date:</strong> ${new Date(doc.uploadDate * 1000).toLocaleDateString()} ${new Date(doc.uploadDate * 1000).toLocaleTimeString()}</p>
                                <p style="margin: 5px 0;"><strong>Status:</strong> ${doc.isVerified ? '<span style="color: #28a745; font-weight: bold;">✅ Verified</span>' : '<span style="color: #ffc107; font-weight: bold;">⏳ Pending Review</span>'}</p>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-left: 15px;">
                                <button onclick="viewDocument('${doc.ipfsHash}')" class="btn btn-primary" style="font-size: 12px; padding: 8px 12px; white-space: nowrap;">
                                    👁️ View
                                </button>
                                <a href="https://ipfs.io/ipfs/${doc.ipfsHash}" target="_blank" class="btn btn-secondary" style="font-size: 12px; padding: 8px 12px; text-decoration: none; text-align: center; white-space: nowrap;">
                                    🔗 Open IPFS
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('')
            }
        </div>
    `;
}

async function approveTourist() {
    if (!currentTouristId) return;
    
    const token = sessionStorage.getItem('authorityToken');
    if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = 'authority-login.html';
        return;
    }
    
    const approveBtn = document.getElementById('approveBtn');
    const validityType = document.querySelector('input[name="validityType"]:checked');
    
    if (!validityType) {
        alert('⚠️ Please select a validity type (Predefined or Custom)');
        return;
    }
    
    let validityDays;
    let expirationDate;
    
    // Calculate validity days based on selection type
    if (validityType.value === 'predefined') {
        const dropdown = document.getElementById('validityPeriod');
        validityDays = parseInt(dropdown.value);
        expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + validityDays);
        
        console.log('✅ Using predefined period:', validityDays, 'days');
    } else if (validityType.value === 'custom') {
        const customDateInput = document.getElementById('customExpirationDate');
        const customDate = customDateInput.value;
        
        if (!customDate) {
            alert('⚠️ Please select an expiration date');
            return;
        }
        
        expirationDate = new Date(customDate + 'T23:59:59'); // Set to end of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (expirationDate <= today) {
            alert('⚠️ Expiration date must be in the future');
            return;
        }
        
        // Calculate days from now
        const timeDiff = expirationDate.getTime() - today.getTime();
        validityDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        if (validityDays > 3650) {
            alert('⚠️ Maximum validity period is 10 years (3650 days)');
            return;
        }
        
        console.log('✅ Using custom expiration date:', customDate, '(', validityDays, 'days)');
    } else {
        alert('⚠️ Invalid validity type selected');
        return;
    }
    
    approveBtn.disabled = true;
    approveBtn.textContent = 'Processing...';
    
    try {
        console.log('Approving tourist:', currentTouristId, 'Validity:', validityDays, 'days', 'Expires:', expirationDate.toLocaleDateString());
        
        const response = await fetch('/api/authority/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                uniqueId: currentTouristId,
                approved: true,
                validityDays: validityDays
            })
        });
        
        if (response.status === 401 || response.status === 403) {
            alert('Session expired. Please login again.');
            sessionStorage.clear();
            window.location.href = 'authority-login.html';
            return;
        }
        
        const result = await response.json();
        console.log('Verification result:', result);
        
        if (result.success) {
            alert(`✅ Tourist verified successfully!\n\nQR Code generated.\nValid until: ${expirationDate.toLocaleDateString()}\nValidity: ${validityDays} days`);
            
            // Show PVC download button and hide approve button
            document.getElementById('approveBtn').style.display = 'none';
            document.getElementById('downloadPvcBtn').style.display = 'inline-block';
            
            // Don't close modal, allow user to download PVC card
            // closeModal();
            loadPendingVerifications(); // Refresh list
        } else {
            alert('❌ Verification failed: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Approval error:', error);
        alert('❌ Error: ' + error.message);
    } finally {
        approveBtn.disabled = false;
        approveBtn.textContent = 'Approve & Generate QR';
    }
}

async function rejectTourist() {
    if (!currentTouristId) return;
    
    const rejectionReason = prompt('Please enter the reason for rejection:', 'Documents incomplete or invalid');
    
    if (!rejectionReason) {
        return; // User cancelled
    }
    
    const token = sessionStorage.getItem('authorityToken');
    if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = 'authority-login.html';
        return;
    }
    
    const rejectBtn = document.getElementById('rejectBtn');
    rejectBtn.disabled = true;
    rejectBtn.textContent = 'Processing...';
    
    try {
        console.log('Rejecting tourist:', currentTouristId, 'Reason:', rejectionReason);
        
        const response = await fetch('/api/authority/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                uniqueId: currentTouristId,
                approved: false,
                rejectionReason: rejectionReason
            })
        });
        
        if (response.status === 401 || response.status === 403) {
            alert('Session expired. Please login again.');
            sessionStorage.clear();
            window.location.href = 'authority-login.html';
            return;
        }
        
        const result = await response.json();
        console.log('Rejection result:', result);
        
        if (result.success) {
            alert(`❌ Tourist registration rejected\n\nReason: ${rejectionReason}\n\nThe tourist has been removed from the pending list.`);
            closeModal();
            loadPendingVerifications();
        } else {
            alert('❌ Rejection failed: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Rejection error:', error);
        alert('❌ Error: ' + error.message);
    } finally {
        rejectBtn.disabled = false;
        rejectBtn.textContent = 'Reject';
    }
}

function closeModal() {
    document.getElementById('verificationModal').style.display = 'none';
    currentTouristId = null;
    
    // Reset buttons
    document.getElementById('approveBtn').style.display = 'inline-block';
    document.getElementById('downloadPvcBtn').style.display = 'none';
}

async function downloadPVCCard() {
    if (!currentTouristId) return;
    
    const token = sessionStorage.getItem('authorityToken');
    if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = 'authority-login.html';
        return;
    }
    
    const downloadBtn = document.getElementById('downloadPvcBtn');
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Generating...';
    
    try {
        console.log('Downloading PVC card for:', currentTouristId);
        
        const response = await fetch('/api/authority/generate-pvc-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                uniqueId: currentTouristId
            })
        });
        
        if (response.status === 401 || response.status === 403) {
            alert('Session expired. Please login again.');
            sessionStorage.clear();
            window.location.href = 'authority-login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to generate PVC card');
        }
        
        // Get the PDF blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `tourist-card-${currentTouristId}.pdf`;
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('✅ PVC card downloaded successfully!');
        
    } catch (error) {
        console.error('PVC download error:', error);
        alert('❌ Error downloading PVC card: ' + error.message);
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = '📄 Download PVC Card';
    }
}

function showMessage(message) {
    const pendingList = document.getElementById('pendingList');
    pendingList.innerHTML = `<p>${message}</p>`;
}

// View document in modal/new tab
function viewDocument(ipfsHash) {
    console.log('Viewing document:', ipfsHash);
    console.log('Hash length:', ipfsHash.length);
    
    // Check if this is a mock IPFS hash (contains invalid characters)
    const isMockHash = /[/+=]/.test(ipfsHash);
    const isTruncated = ipfsHash.length < 46 && ipfsHash.length > 0;
    
    if (isMockHash) {
        alert('⚠️ Mock IPFS Hash Detected\n\n' +
              'This document was uploaded using mock IPFS storage for development.\n' +
              'The file exists in the blockchain but not on the real IPFS network.\n\n' +
              'To view real documents:\n' +
              '1. Configure real IPFS in backend/config/ipfs.js\n' +
              '2. Sign up for free IPFS service:\n' +
              '   • Infura: https://infura.io\n' +
              '   • Pinata: https://pinata.cloud\n' +
              '   • Web3.Storage: https://web3.storage\n\n' +
              'Hash: ' + ipfsHash + ' (length: ' + ipfsHash.length + ')');
        return;
    }
    
    if (isTruncated) {
        alert('⚠️ Truncated IPFS Hash Detected\n\n' +
              'The IPFS hash appears to be incomplete.\n' +
              'Valid IPFS hashes (CIDv0) are 46 characters long.\n\n' +
              'Current hash: ' + ipfsHash + '\n' +
              'Current length: ' + ipfsHash.length + ' characters\n' +
              'Expected length: 46 characters\n\n' +
              'This may be due to:\n' +
              '• Database field length limit\n' +
              '• UI display truncation\n' +
              '• Storage error during upload\n\n' +
              'Please check the blockchain data or re-upload the document.');
        return;
    }
    
    // Create modal for document viewing
    const existingModal = document.getElementById('documentViewModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'documentViewModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;
    
    const ipfsGateways = [
        `https://ipfs.io/ipfs/${ipfsHash}`,
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`
    ];
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; max-width: 90vw; max-height: 90vh; overflow: auto; position: relative;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0;">
                <div>
                    <h3 style="margin: 0; color: white;">📄 Document Viewer</h3>
                    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">IPFS Hash: ${ipfsHash}</p>
                </div>
                <button onclick="document.getElementById('documentViewModal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ✕
                </button>
            </div>
            <div style="padding: 20px;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #2196f3;">
                    <h4 style="margin: 0 0 10px 0; color: #1976d2;">📌 How to View Document</h4>
                    <p style="margin: 5px 0; color: #555; font-size: 14px;">IPFS documents may take time to load or require opening in a new tab. Choose an option below:</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    ${ipfsGateways.map((url, index) => `
                        <a href="${url}" target="_blank" class="btn btn-primary" style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            padding: 12px 20px;
                            text-decoration: none;
                            font-size: 14px;
                            border-radius: 8px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            transition: all 0.3s;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'">
                            🌐 Gateway ${index + 1}
                        </a>
                    `).join('')}
                </div>

                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">🔗 Direct IPFS Links:</h4>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${ipfsGateways.map((url, index) => `
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="color: #666; font-size: 12px; width: 60px;">Gateway ${index + 1}:</span>
                                <input readonly value="${url}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; font-family: monospace;" onclick="this.select()" />
                                <button onclick="navigator.clipboard.writeText('${url}'); this.textContent='✓'; setTimeout(() => this.textContent='📋', 2000)" style="padding: 8px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">📋</button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="background: #fff9e6; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <h4 style="margin: 0 0 10px 0; color: #f57c00;">💡 Viewing Tips</h4>
                    <ul style="margin: 5px 0; padding-left: 20px; color: #666; font-size: 13px;">
                        <li>Click any "Gateway" button above to open the document in a new tab</li>
                        <li>If one gateway doesn't work, try another one</li>
                        <li>IPFS content is decentralized and may take a moment to load</li>
                        <li>Some browsers may block IPFS iframes - use the gateway links instead</li>
                        <li>Copy the link and paste in a new browser window if needed</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px; padding: 20px; background: #fafafa; border-radius: 8px;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        📦 Stored on IPFS (InterPlanetary File System) - Decentralized & Permanent Storage
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close on ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Make functions available globally
window.viewTourist = viewTourist;
window.viewDocument = viewDocument;
