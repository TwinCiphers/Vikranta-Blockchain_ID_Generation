const { web3, touristRegistryContract } = require('./backend/config/blockchain');

async function addAuthority() {
    try {
        const accounts = await web3.eth.getAccounts();
        const admin = accounts[0];
        
        console.log('\n=== Current Authorities ===\n');
        console.log('Admin/Deployer:', admin);
        console.log('Is Authority:', await touristRegistryContract.methods.authorities(admin).call());
        
        // Check all accounts
        console.log('\n=== All Available Accounts ===\n');
        for (let i = 0; i < Math.min(accounts.length, 5); i++) {
            const isAuth = await touristRegistryContract.methods.authorities(accounts[i]).call();
            console.log(`Account ${i}: ${accounts[i]}`);
            console.log(`  Authority: ${isAuth ? '✅ Yes' : '❌ No'}\n`);
        }
        
        // Prompt to add new authority
        console.log('\n=== Add New Authority ===\n');
        console.log('To add a new authority, uncomment and modify the following code:\n');
        console.log('const newAuthority = "0xYourAddressHere";');
        console.log('const tx = await touristRegistryContract.methods');
        console.log('    .addAuthority(newAuthority)');
        console.log('    .send({ from: admin, gas: 3000000 });');
        console.log('console.log("Authority added:", tx.transactionHash);');
        
        // Example: Add second account as authority (uncomment to use)
        /*
        const newAuthority = accounts[1];
        console.log('\nAdding authority:', newAuthority);
        const tx = await touristRegistryContract.methods
            .addAuthority(newAuthority)
            .send({ from: admin, gas: 3000000 });
        console.log('✅ Authority added successfully!');
        console.log('Transaction:', tx.transactionHash);
        */
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

addAuthority();
