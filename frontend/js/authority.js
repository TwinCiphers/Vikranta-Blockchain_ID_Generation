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
        
        const response = await fetch('/api/authority/pending');
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
            <h3>Tourist Information</h3>
            <p><strong>Name:</strong> ${tourist.name}</p>
            <p><strong>Nationality:</strong> ${tourist.nationality}</p>
            <p><strong>Registration Date:</strong> ${new Date(tourist.registrationDate * 1000).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${tourist.isVerified ? '✅ Verified' : '⏳ Pending'}</p>
        </div>
    `;
    
    documentsDiv.innerHTML = `
        <div class="documents-info">
            <h3>Uploaded Documents (${documents.length})</h3>
            ${documents.map((doc, index) => `
                <div class="document-item">
                    <p><strong>Type:</strong> ${doc.documentType}</p>
                    <p><strong>IPFS Hash:</strong> ${doc.ipfsHash}</p>
                    <p><strong>Upload Date:</strong> ${new Date(doc.uploadDate * 1000).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${doc.isVerified ? '✅ Verified' : '⏳ Pending'}</p>
                </div>
            `).join('')}
        </div>
    `;
}

async function approveTourist() {
    if (!currentTouristId) return;
    
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uniqueId: currentTouristId,
                approved: true,
                validityDays: validityDays
            })
        });
        
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
    
    if (!confirm('Are you sure you want to reject this tourist registration?')) {
        return;
    }
    
    try {
        console.log('Rejecting tourist:', currentTouristId);
        
        const response = await fetch('/api/authority/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uniqueId: currentTouristId,
                approved: false
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Tourist registration rejected');
            closeModal();
            loadPendingVerifications();
        }
    } catch (error) {
        console.error('Rejection error:', error);
        alert('Error rejecting tourist');
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
    
    const downloadBtn = document.getElementById('downloadPvcBtn');
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Generating...';
    
    try {
        console.log('Downloading PVC card for:', currentTouristId);
        
        const response = await fetch('/api/authority/generate-pvc-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uniqueId: currentTouristId
            })
        });
        
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

// Make viewTourist available globally
window.viewTourist = viewTourist;
