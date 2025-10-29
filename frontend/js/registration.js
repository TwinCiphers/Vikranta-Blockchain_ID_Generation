document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('Form submitted!');
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
        // Connect wallet if not connected
        if (!window.account || window.account === null) {
            console.log('Wallet not connected, connecting...');
            const connected = await connectWallet();
            if (!connected) {
                throw new Error('Please connect your wallet first');
            }
        }
        
        console.log('Using wallet:', window.account);
        
        // Gather form data
        const formData = {
            name: document.getElementById('name').value,
            nationality: document.getElementById('nationality').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            passportNumber: document.getElementById('passportNumber').value,
            address: document.getElementById('address').value,
            walletAddress: window.account
        };
        
        console.log('Form data:', formData);
        console.log('Sending to:', '/api/tourist/register');
        
        // Send to backend
        const response = await fetch('/api/tourist/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            showResult('success', `
                <strong>✅ Registration successful!</strong><br><br>
                <p><strong>Your Unique ID:</strong></p>
                <div class="unique-id">${result.uniqueId}</div>
                <p><strong>Transaction:</strong></p>
                <div class="transaction">${result.transactionHash || 'Pending'}</div>
                <br>
                <p>Please proceed to upload required documents.</p>
            `);
            
            setTimeout(() => {
                window.location.href = 'dashboard.html?uniqueId=' + result.uniqueId;
            }, 3000);
        } else {
            showResult('error', '❌ ' + (result.message || 'Registration failed'));
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showResult('error', '❌ Registration failed: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
});

function showResult(type, message) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.className = `result-box ${type}`;
        resultDiv.innerHTML = message || '';
        resultDiv.style.display = message ? 'block' : 'none';
    }
}

window.onload = async () => {
    console.log('Page loaded, checking connection...');
    console.log('window.account:', window.account);
    
    const statusDiv = document.getElementById('walletStatus');
    statusDiv.innerHTML = '⏳ Checking wallet connection...';
    
    const connected = await checkConnection();
    console.log('Connected:', connected);
    console.log('window.account after check:', window.account);
    
    // Access the global account variable from web3-connection.js
    if (connected && window.account && window.account !== null) {
        statusDiv.className = 'alert alert-success';
        statusDiv.textContent = `✅ Connected: ${window.account.substring(0, 6)}...${window.account.substring(window.account.length - 4)}`;
    } else {
        statusDiv.className = 'alert alert-warning';
        statusDiv.innerHTML = '⚠️ Wallet not connected. <button onclick="connectAndReload()" class="btn btn-primary" style="margin-left: 10px;">Connect MetaMask</button>';
    }
};

// Helper function for the connect button
async function connectAndReload() {
    const result = await connectWallet();
    if (result) {
        window.location.reload();
    }
}