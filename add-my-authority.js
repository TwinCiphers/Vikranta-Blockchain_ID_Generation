const { web3, touristRegistryContract } = require('./backend/config/blockchain');

async function addMyAuthority() {
    try {
        const accounts = await web3.eth.getAccounts();
        const admin = accounts[0];
        
        // Your MetaMask address to be added as authority
        const newAuthority = '0xeae889f45cebe052f3e6f9ffb10a80ca9a35c492';
        
        console.log('\n=== Adding Your MetaMask as Authority ===\n');
        console.log('Admin Address:', admin);
        console.log('Your MetaMask:', newAuthority);
        
        // Check if already an authority
        const isAlreadyAuth = await touristRegistryContract.methods
            .authorities(newAuthority)
            .call();
        
        if (isAlreadyAuth) {
            console.log('\n✅ Your address is already registered as an authority!');
            console.log('\nYou can login now at: https://localhost/authority-login.html');
            console.log('Wallet: ' + newAuthority);
            console.log('Passphrase: vikrantaTBS$2025');
            return;
        }
        
        console.log('\nAdding your address to smart contract...');
        
        // Add authority
        const tx = await touristRegistryContract.methods
            .addAuthority(newAuthority)
            .send({ from: admin, gas: 3000000 });
        
        console.log('\n✅ Authority added successfully!');
        console.log('Transaction Hash:', tx.transactionHash);
        console.log('Block Number:', tx.blockNumber);
        
        // Verify
        const isAuth = await touristRegistryContract.methods
            .authorities(newAuthority)
            .call();
        
        console.log('\n=== Verification ===');
        console.log('Address:', newAuthority);
        console.log('Is Authority:', isAuth ? '✅ Yes' : '❌ No');
        
        if (isAuth) {
            console.log('\n🎉 Success! You can now login:');
            console.log('\n   URL: https://localhost/authority-login.html');
            console.log('   Wallet: ' + newAuthority);
            console.log('   Passphrase: vikrantaTBS$2025');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

addMyAuthority();
