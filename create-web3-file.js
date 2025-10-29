const fs = require('fs');

const content = `let web3;
let account = null;
let contract;

const CONTRACT_ADDRESS = '0x5B5a4AF0177110913a0b85A469327657C8b43aCF';
let CONTRACT_ABI = null;

async function loadContractABI() {
    try {
        const response = await fetch('/contract-abi.json');
        CONTRACT_ABI = await response.json();
        console.log('Contract ABI loaded');
    } catch (error) {
        console.error('Error loading contract ABI:', error);
    }
}

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            if (!CONTRACT_ABI) {
                await loadContractABI();
            }
            
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            account = accounts[0];
            
            if (typeof Web3 === 'undefined') {
                console.error('Web3 not loaded');
                alert('Web3 library not loaded. Please refresh the page.');
                return null;
            }
            
            web3 = new Web3(window.ethereum);
            
            if (CONTRACT_ABI) {
                contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            }
            
            console.log('Connected:', account);
            
            const statusDiv = document.getElementById('walletStatus');
            if (statusDiv) {
                statusDiv.className = 'alert alert-success';
                statusDiv.textContent = \`Connected: \${account.substring(0, 6)}...\${account.substring(account.length - 4)}\`;
            }
            
            return account;
            
        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect wallet: ' + error.message);
            return null;
        }
    } else {
        alert('MetaMask is not installed!');
        window.open('https://metamask.io/download/', '_blank');
        return null;
    }
}

async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            if (!CONTRACT_ABI) {
                await loadContractABI();
            }
            
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            
            if (accounts.length > 0) {
                account = accounts[0];
                
                if (typeof Web3 !== 'undefined') {
                    web3 = new Web3(window.ethereum);
                    if (CONTRACT_ABI) {
                        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                    }
                }
                return true;
            }
        } catch (error) {
            console.error('Check connection error:', error);
        }
    }
    return false;
}

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            account = accounts[0];
        } else {
            account = null;
        }
        window.location.reload();
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}
`;

fs.writeFileSync('frontend/js/web3-connection.js', content);
console.log('✅ web3-connection.js created successfully!');
