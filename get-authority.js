const { web3, touristRegistryContract } = require('./backend/config/blockchain');

async function getAuthority() {
    const accounts = await web3.eth.getAccounts();
    console.log('Deployer/Authority Address:', accounts[0]);
    
    // Verify it's an authority
    const isAuth = await touristRegistryContract.methods.authorities(accounts[0]).call();
    console.log('Is Authority:', isAuth);
}

getAuthority();
