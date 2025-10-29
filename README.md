# Tourist Registration Blockchain System

A complete blockchain-based tourist registration system with unique ID generation, encrypted user information storage, document verification, and PVC card creation with QR codes.

## 🌟 Features

- **Blockchain Integration**: Ethereum-based smart contracts for immutable records
- **Secure Encryption**: AES-256 encryption for sensitive tourist data
- **Decentralized Storage**: IPFS for document storage
- **QR Code Generation**: Unique QR codes for each registered tourist
- **PVC Card Creation**: Digital tourist cards with verification codes
- **Authority Panel**: Administrative interface for document verification
- **MetaMask Integration**: Wallet-based authentication and transactions

## 🛠️ Technology Stack

- **Blockchain**: Ethereum (Solidity)
- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript
- **Storage**: IPFS
- **Libraries**: Web3.js, QRCode, PDFKit, Crypto-JS
- **Development**: Truffle, Ganache

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Truffle Suite (`npm install -g truffle`)
- Ganache (for local blockchain development)
- Infura account (for testnet/mainnet deployment)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd blockchain
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Blockchain Configuration
BLOCKCHAIN_PROVIDER=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
MNEMONIC=your twelve word mnemonic phrase here

# IPFS Configuration
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_AUTH=YOUR_IPFS_AUTH_TOKEN

# Application Configuration
PORT=3000
APP_URL=http://localhost:3000
ENCRYPTION_KEY=your-strong-encryption-key-here

# Database (Optional)
MONGODB_URI=mongodb://localhost:27017/tourist_registry
```

### 4. Compile smart contracts
```bash
truffle compile
```

### 5. Deploy smart contracts

For local development (Ganache):
```bash
truffle migrate --network development
```

For Sepolia testnet:
```bash
truffle migrate --network sepolia
```

### 6. Start the backend server
```bash
npm run dev
```

### 7. Access the application
Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
blockchain/
├── contracts/              # Smart contracts
│   ├── TouristRegistry.sol
│   └── Migrations.sol
├── backend/               # Backend server
│   ├── server.js
│   ├── config/           # Configuration files
│   │   ├── blockchain.js
│   │   └── ipfs.js
│   ├── routes/           # API routes
│   │   ├── tourist.js
│   │   └── authority.js
│   └── utils/            # Utility functions
│       ├── qrGenerator.js
│       ├── encryption.js
│       └── pvcCardGenerator.js
├── frontend/             # Frontend files
│   ├── index.html
│   ├── register.html
│   ├── login.html
│   ├── dashboard.html
│   ├── authority-panel.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── registration.js
│       └── web3-connection.js
├── package.json
├── truffle-config.js
├── .env.example
└── README.md
```

## 🔑 Usage

### For Tourists

1. **Register**
   - Visit the registration page
   - Connect your MetaMask wallet
   - Fill in your personal details
   - Submit the registration form

2. **Upload Documents**
   - Login to your dashboard
   - Upload required documents (passport, ID, etc.)
   - Wait for authority verification

3. **Download Card**
   - Once verified, download your digital PVC card
   - Save your unique QR code for verification

### For Authorities

1. **Access Authority Panel**
   - Connect with an authorized wallet address
   - View pending registrations

2. **Verify Documents**
   - Review submitted documents
   - Approve or reject applications
   - Add verification notes

3. **Generate Cards**
   - Generate PVC cards for approved tourists
   - Issue QR codes for verification

## 🔐 Security Features

- **Encryption**: All sensitive data is encrypted using AES-256
- **Blockchain**: Immutable records on Ethereum blockchain
- **IPFS**: Decentralized document storage
- **Wallet Authentication**: MetaMask-based secure login
- **Access Control**: Role-based access for tourists and authorities

## 📡 API Endpoints

### Tourist Endpoints
- `POST /api/tourist/register` - Register new tourist
- `POST /api/tourist/upload-document` - Upload documents
- `GET /api/tourist/info/:uniqueId` - Get tourist information

### Authority Endpoints
- `GET /api/authority/pending` - Get pending verifications
- `POST /api/authority/verify` - Verify tourist
- `POST /api/authority/generate-pvc-card` - Generate PVC card
- `GET /api/authority/all-tourists` - Get all tourists

## 🧪 Testing

Run tests using Truffle:
```bash
truffle test
```

## 📝 Smart Contract Functions

### Main Functions
- `registerTourist()` - Register a new tourist
- `uploadDocument()` - Upload document hash
- `verifyTourist()` - Verify tourist by authority
- `getTourist()` - Get tourist information
- `getPendingVerifications()` - Get pending tourists

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Review existing issues on GitHub
- Contact the development team

## 🔗 Resources

- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [Truffle Documentation](https://trufflesuite.com/docs/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [IPFS Documentation](https://docs.ipfs.io/)
- [MetaMask Documentation](https://docs.metamask.io/)

---
## For Website view check out these pics

[Website View](https://drive.google.com/file/d/1IiTSi1eTMEOrbd4EX3J0dS8G9EHof_U8/view?usp=drivesdk)

**Built with ❤️ for secure and transparent tourist registration**
