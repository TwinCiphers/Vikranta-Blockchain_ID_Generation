const { Web3 } = require('web3');
require('dotenv').config();

// Initialize Web3 connection
const web3 = new Web3(process.env.BLOCKCHAIN_PROVIDER || 'http://localhost:8545');

// Contract configuration
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require('../../build/contracts/TouristRegistry.json').abi;

// Initialize contract instance
const touristRegistryContract = new web3.eth.Contract(contractABI, contractAddress);

module.exports = {
    web3,
    touristRegistryContract,
    contractAddress
};
