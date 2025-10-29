// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TouristRegistry {
    
    struct Tourist {
        string uniqueId;
        string name;
        string nationality;
        string encryptedDataHash;
        string qrCodeHash;
        bool isVerified;
        bool isActive;
        uint256 registrationDate;
        uint256 verificationDate;
        uint256 expirationDate;
        address touristAddress;
        address verifiedBy;
    }
    
    struct Document {
        string documentType;
        string ipfsHash;
        uint256 uploadDate;
        bool isVerified;
    }
    
    mapping(string => Tourist) public tourists;
    mapping(string => Document[]) public touristDocuments;
    mapping(address => string) public addressToUniqueId;
    mapping(address => bool) public authorities;
    
    address public admin;
    uint256 public totalTourists;
    
    event TouristRegistered(string uniqueId, address indexed touristAddress, uint256 timestamp);
    event DocumentUploaded(string uniqueId, string documentType, string ipfsHash);
    event TouristVerified(string uniqueId, address indexed authority, uint256 verificationDate, uint256 expirationDate);
    event QRCodeGenerated(string uniqueId, string qrCodeHash);
    event TouristExpired(string uniqueId, uint256 timestamp);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyAuthority() {
        require(authorities[msg.sender], "Only authorized authorities can perform this action");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        authorities[msg.sender] = true;
    }
    
    function addAuthority(address _authority) public onlyAdmin {
        authorities[_authority] = true;
    }
    
    function removeAuthority(address _authority) public onlyAdmin {
        authorities[_authority] = false;
    }
    
    function registerTourist(
        string memory _uniqueId,
        string memory _name,
        string memory _nationality,
        string memory _encryptedDataHash,
        address _touristAddress
    ) public {
        require(bytes(tourists[_uniqueId].uniqueId).length == 0, "Tourist already registered");
        
        Tourist memory newTourist = Tourist({
            uniqueId: _uniqueId,
            name: _name,
            nationality: _nationality,
            encryptedDataHash: _encryptedDataHash,
            qrCodeHash: "",
            isVerified: false,
            isActive: true,
            registrationDate: block.timestamp,
            verificationDate: 0,
            expirationDate: 0,
            touristAddress: _touristAddress,
            verifiedBy: address(0)
        });
        
        tourists[_uniqueId] = newTourist;
        addressToUniqueId[_touristAddress] = _uniqueId;
        totalTourists++;
        
        emit TouristRegistered(_uniqueId, _touristAddress, block.timestamp);
    }
    
    function uploadDocument(
        string memory _uniqueId,
        string memory _documentType,
        string memory _ipfsHash
    ) public {
        require(bytes(tourists[_uniqueId].uniqueId).length > 0, "Tourist not registered");
        require(
            tourists[_uniqueId].touristAddress == msg.sender || authorities[msg.sender],
            "Unauthorized"
        );
        
        Document memory newDocument = Document({
            documentType: _documentType,
            ipfsHash: _ipfsHash,
            uploadDate: block.timestamp,
            isVerified: false
        });
        
        touristDocuments[_uniqueId].push(newDocument);
        
        emit DocumentUploaded(_uniqueId, _documentType, _ipfsHash);
    }
    
    function verifyTourist(
        string memory _uniqueId, 
        string memory _qrCodeHash,
        uint256 _validityDays
    ) 
        public 
        onlyAuthority 
    {
        require(bytes(tourists[_uniqueId].uniqueId).length > 0, "Tourist not registered");
        require(!tourists[_uniqueId].isVerified, "Tourist already verified");
        require(_validityDays > 0 && _validityDays <= 3650, "Validity must be between 1 and 3650 days"); // Max 10 years
        
        uint256 expirationDate = block.timestamp + (_validityDays * 1 days);
        
        tourists[_uniqueId].isVerified = true;
        tourists[_uniqueId].qrCodeHash = _qrCodeHash;
        tourists[_uniqueId].verificationDate = block.timestamp;
        tourists[_uniqueId].expirationDate = expirationDate;
        tourists[_uniqueId].verifiedBy = msg.sender;
        
        emit TouristVerified(_uniqueId, msg.sender, block.timestamp, expirationDate);
        emit QRCodeGenerated(_uniqueId, _qrCodeHash);
    }
    
    function checkExpiration(string memory _uniqueId) public returns (bool) {
        require(bytes(tourists[_uniqueId].uniqueId).length > 0, "Tourist not registered");
        
        if (tourists[_uniqueId].isVerified && 
            tourists[_uniqueId].expirationDate > 0 && 
            block.timestamp >= tourists[_uniqueId].expirationDate) {
            
            tourists[_uniqueId].isActive = false;
            emit TouristExpired(_uniqueId, block.timestamp);
            return true; // Expired
        }
        
        return false; // Not expired
    }
    
    function isValid(string memory _uniqueId) public view returns (bool) {
        Tourist memory t = tourists[_uniqueId];
        
        if (!t.isVerified || !t.isActive) {
            return false;
        }
        
        if (t.expirationDate > 0 && block.timestamp >= t.expirationDate) {
            return false; // Expired
        }
        
        return true;
    }
    
    function getTouristInfo(string memory _uniqueId) 
        public 
        view 
        returns (
            string memory name,
            string memory nationality,
            string memory encryptedDataHash,
            string memory qrCodeHash,
            bool isVerified,
            uint256 registrationDate,
            uint256 verificationDate,
            uint256 expirationDate,
            bool isActive
        ) 
    {
        Tourist memory t = tourists[_uniqueId];
        return (
            t.name,
            t.nationality,
            t.encryptedDataHash,
            t.qrCodeHash,
            t.isVerified,
            t.registrationDate,
            t.verificationDate,
            t.expirationDate,
            t.isActive
        );
    }
    
    function getTouristDocuments(string memory _uniqueId) 
        public 
        view 
        returns (Document[] memory) 
    {
        return touristDocuments[_uniqueId];
    }
}