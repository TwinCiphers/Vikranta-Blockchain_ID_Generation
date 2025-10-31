const { web3, touristRegistryContract } = require('./backend/config/blockchain');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function addNewAuthority() {
    try {
        const accounts = await web3.eth.getAccounts();
        const admin = accounts[0];
        
        console.log('\n=== Add New Authority to System ===\n');
        console.log('Current Admin:', admin);
        console.log('Admin Is Authority:', await touristRegistryContract.methods.authorities(admin).call());
        console.log('\n');
        
        rl.question('Enter the wallet address to add as authority: ', async (newAuthority) => {
            try {
                if (!newAuthority || !newAuthority.startsWith('0x')) {
                    console.log('❌ Invalid address format');
                    rl.close();
                    return;
                }
                
                // Check if already an authority
                const isAlreadyAuth = await touristRegistryContract.methods
                    .authorities(newAuthority)
                    .call();
                
                if (isAlreadyAuth) {
                    console.log('\n✅ This address is already an authority!');
                    console.log('You can login with this address and passphrase: vikrantaTBS$2025');
                    rl.close();
                    return;
                }
                
                console.log('\n🔄 Adding authority:', newAuthority);
                console.log('This will be added to the blockchain...\n');
                
                const tx = await touristRegistryContract.methods
                    .addAuthority(newAuthority)
                    .send({ from: admin, gas: 3000000 });
                
                console.log('✅ Authority added successfully!');
                console.log('Transaction Hash:', tx.transactionHash);
                console.log('\n📋 Authority Details:');
                console.log('Address:', newAuthority);
                console.log('Passphrase: vikrantaTBS$2025');
                console.log('\n✅ You can now login with this address!');
                
                rl.close();
            } catch (error) {
                console.error('❌ Error adding authority:', error.message);
                rl.close();
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
    }
}

addNewAuthority();
