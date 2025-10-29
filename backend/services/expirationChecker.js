const { touristRegistryContract } = require('../config/blockchain');

class ExpirationChecker {
    constructor(intervalMinutes = 60) {
        this.intervalMinutes = intervalMinutes;
        this.intervalId = null;
        this.isRunning = false;
        this.trackedTourists = new Set();
    }

    /**
     * Start the automatic expiration checker
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️  Expiration checker is already running');
            return;
        }

        console.log(`🕐 Starting automatic expiration checker (checks every ${this.intervalMinutes} minutes)`);
        
        // Run immediately
        this.checkExpirations();
        
        // Then run at intervals
        this.intervalId = setInterval(() => {
            this.checkExpirations();
        }, this.intervalMinutes * 60 * 1000);
        
        this.isRunning = true;
    }

    /**
     * Stop the automatic expiration checker
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isRunning = false;
            console.log('🛑 Expiration checker stopped');
        }
    }

    /**
     * Add a tourist to track for expiration
     */
    trackTourist(uniqueId) {
        this.trackedTourists.add(uniqueId);
        console.log(`📝 Now tracking ${this.trackedTourists.size} tourists for expiration`);
    }

    /**
     * Check all tracked tourists for expiration
     */
    async checkExpirations() {
        if (this.trackedTourists.size === 0) {
            console.log('📭 No tourists to check for expiration');
            return;
        }

        console.log(`🔍 Checking ${this.trackedTourists.size} tourists for expiration...`);
        
        let expiredCount = 0;
        const now = Math.floor(Date.now() / 1000);
        
        for (const uniqueId of this.trackedTourists) {
            try {
                // Get tourist info
                const touristData = await touristRegistryContract.methods
                    .getTouristInfo(uniqueId)
                    .call();
                
                const isVerified = touristData[4];
                const expirationDate = touristData[7] ? Number(touristData[7]) : 0;
                const isActive = touristData[8];
                
                // Check if expired
                if (isVerified && expirationDate > 0 && now >= expirationDate && isActive) {
                    console.log(`⏰ Tourist ${uniqueId} has expired! Marking as inactive...`);
                    
                    // Call checkExpiration to mark as inactive on blockchain
                    const accounts = await touristRegistryContract.methods.owner
                        ? await touristRegistryContract.methods.owner().call()
                        : null;
                    
                    // Use web3 to get accounts
                    const { web3 } = require('../config/blockchain');
                    const accountList = await web3.eth.getAccounts();
                    
                    const tx = await touristRegistryContract.methods
                        .checkExpiration(uniqueId)
                        .send({ from: accountList[0], gas: 300000 });
                    
                    console.log(`✅ Tourist ${uniqueId} marked as expired. TX: ${tx.transactionHash}`);
                    expiredCount++;
                    
                    // Remove from tracking (already expired)
                    this.trackedTourists.delete(uniqueId);
                }
                
            } catch (error) {
                console.error(`❌ Error checking expiration for ${uniqueId}:`, error.message);
            }
        }
        
        if (expiredCount > 0) {
            console.log(`✅ Marked ${expiredCount} tourist(s) as expired`);
        } else {
            console.log(`✅ No expired tourists found`);
        }
    }

    /**
     * Manually check a specific tourist
     */
    async checkTouristExpiration(uniqueId) {
        try {
            const { web3 } = require('../config/blockchain');
            const accounts = await web3.eth.getAccounts();
            
            const tx = await touristRegistryContract.methods
                .checkExpiration(uniqueId)
                .send({ from: accounts[0], gas: 300000 });
            
            console.log(`✅ Checked expiration for ${uniqueId}. TX: ${tx.transactionHash}`);
            return tx;
        } catch (error) {
            console.error(`❌ Error checking expiration:`, error.message);
            throw error;
        }
    }

    /**
     * Get checker status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            intervalMinutes: this.intervalMinutes,
            trackedTourists: this.trackedTourists.size,
            touristList: Array.from(this.trackedTourists)
        };
    }
}

// Create singleton instance
const expirationChecker = new ExpirationChecker(60); // Check every 60 minutes

module.exports = expirationChecker;
