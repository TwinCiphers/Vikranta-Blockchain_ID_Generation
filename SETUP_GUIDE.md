# Configuration Setup Guide

## 1. INFURA_PROJECT_ID (For Blockchain Connection)

**Steps to get Infura Project ID:**

1. Go to https://infura.io/
2. Click "Sign Up" or "Get Started for Free"
3. Create an account (free tier is sufficient)
4. Once logged in, click "Create New Key" or "Create New Project"
5. Select "Web3 API (Ethereum)"
6. Give your project a name (e.g., "Tourist Registration")
7. Copy the **PROJECT ID** - this is your INFURA_PROJECT_ID

**Example:**
```
INFURA_PROJECT_ID=abc123def456ghi789jkl012mno345pq
```

---

## 2. MNEMONIC (12-word seed phrase)

**For Development/Testing:**

You have two options:

### Option A: Use Ganache (Local Blockchain) - RECOMMENDED FOR TESTING
```bash
# Install Ganache
npm install -g ganache

# Run Ganache
ganache

# It will display accounts with private keys and a mnemonic phrase
# Copy the mnemonic phrase it displays
```

**Example Ganache output:**
```
Available Accounts
==================
(0) 0x1234... (100 ETH)
(1) 0x5678... (100 ETH)

Private Keys
==================
(0) 0xabc...
(1) 0xdef...

HD Wallet
==================
Mnemonic:      word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
```

### Option B: Create from MetaMask
1. Open MetaMask
2. Create a new wallet
3. **IMPORTANT:** Save the 12-word recovery phrase
4. Use this phrase as your MNEMONIC

⚠️ **WARNING:** Never use a mnemonic with real funds for development!

**Example:**
```
MNEMONIC=word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
```

---

## 3. CONTRACT_ADDRESS

**This comes AFTER you deploy your smart contract:**

### Steps:
1. First, start your local blockchain (Ganache)
2. Compile contracts: `npm run compile`
3. Deploy contracts: `npm run migrate`
4. After deployment, you'll see output like:

```
Deploying 'TouristRegistry'
---------------------------
> transaction hash:    0x123...
> contract address:    0x5FbDB2315678afecb367f032d93F642f64180aa3
> block number:        2
> account:             0x123...
```

5. Copy the **contract address** (e.g., `0x5FbDB2315678afecb367f032d93F642f64180aa3`)
6. Update your .env file with this address

**Example:**
```
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## 4. NETWORK

**Choose based on your deployment target:**

- `development` - Local Ganache/Hardhat (DEFAULT FOR TESTING)
- `sepolia` - Ethereum Sepolia testnet
- `goerli` - Ethereum Goerli testnet
- `mainnet` - Ethereum mainnet (PRODUCTION ONLY)

**For learning/testing, use:**
```
NETWORK=development
BLOCKCHAIN_PROVIDER=http://localhost:8545
```

**For Sepolia testnet:**
```
NETWORK=sepolia
BLOCKCHAIN_PROVIDER=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

---

## 5. IPFS Configuration (For Document Storage)

### Option A: Use Infura IPFS (Recommended)

1. Go to https://infura.io/
2. From your dashboard, create an IPFS project
3. Click on your IPFS project
4. Go to "Settings"
5. You'll see:
   - **Project ID**
   - **API Key Secret**
6. Create Base64 authorization token:

```bash
# On Linux/Mac/Git Bash:
echo -n "PROJECT_ID:API_KEY_SECRET" | base64

# Example:
echo -n "2abc123:def456ghi789" | base64
# Output: MmFiYzEyMzpkZWY0NTZnaGk3ODk=
```

**Configuration:**
```
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_AUTH=Basic MmFiYzEyMzpkZWY0NTZnaGk3ODk=
```

### Option B: Use Local IPFS (For Testing)

```bash
# Install IPFS
# Visit: https://docs.ipfs.tech/install/

# After installation, start IPFS daemon
ipfs daemon
```

**Configuration:**
```
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http
IPFS_AUTH=
```

---

## 6. ENCRYPTION_KEY (32 characters)

**This is a secret key you create yourself for encrypting sensitive data.**

### Generate a secure random key:

```bash
# On Linux/Mac/Git Bash:
openssl rand -base64 32

# Or using Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or simply create a strong 32+ character password:
```

**Example:**
```
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

⚠️ **IMPORTANT:** Keep this key secret! If you lose it, encrypted data cannot be recovered.

---

## 7. JWT_SECRET (For Authentication Tokens)

**Similar to ENCRYPTION_KEY, create a random secret:**

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or create a strong password (20+ characters)
```

**Example:**
```
JWT_SECRET=my_super_secret_jwt_key_12345_abcdef_ghijkl
```

---

## 📋 Complete .env File Example (Development)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Blockchain Configuration (LOCAL DEVELOPMENT)
BLOCKCHAIN_PROVIDER=http://localhost:8545
CONTRACT_ADDRESS=
MNEMONIC=word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
NETWORK=development

# IPFS Configuration (Using Infura)
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_AUTH=Basic YOUR_BASE64_ENCODED_AUTH

# Security
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
JWT_SECRET=my_super_secret_jwt_key_for_authentication_tokens

# Application
APP_URL=http://localhost:3000
```

---

## 📋 Complete .env File Example (Sepolia Testnet)

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Blockchain Configuration (SEPOLIA TESTNET)
BLOCKCHAIN_PROVIDER=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
CONTRACT_ADDRESS=0xYourDeployedContractAddress
MNEMONIC=your twelve word mnemonic phrase from metamask wallet here
NETWORK=sepolia

# IPFS Configuration
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_AUTH=Basic YOUR_BASE64_ENCODED_AUTH

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here
JWT_SECRET=your_jwt_secret_key_here

# Application
APP_URL=https://your-domain.com
```

---

## 🚀 Quick Start Steps

1. **Create Infura account** → Get PROJECT_ID
2. **Install Ganache** → Get MNEMONIC
3. **Generate secrets** → ENCRYPTION_KEY and JWT_SECRET
4. **Create .env file** → Copy from .env.example
5. **Start Ganache** → `ganache`
6. **Deploy contracts** → `npm run migrate`
7. **Get CONTRACT_ADDRESS** → From deployment output
8. **Update .env** → Add CONTRACT_ADDRESS
9. **Start server** → `npm start`

---

## ✅ Testing Your Configuration

```bash
# Test blockchain connection
node -e "const Web3 = require('web3'); const web3 = new Web3('http://localhost:8545'); web3.eth.getBlockNumber().then(console.log);"

# If you see a block number, your connection works!
```

---

## 🆘 Need Help?

- Infura: https://docs.infura.io/
- MetaMask: https://metamask.io/
- Ganache: https://trufflesuite.com/ganache/
- IPFS: https://docs.ipfs.tech/
