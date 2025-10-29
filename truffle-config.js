require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "5777"
    },
    docker: {
      host: "blockchain",
      port: 8545,
      network_id: "5777",
      gas: 6721975,
      gasPrice: 20000000000
    },
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
      network_id: 11155111,
      gas: 5500000
    }
  },
  compilers: {
    solc: {
      version: "0.8.19"
    }
  }
};