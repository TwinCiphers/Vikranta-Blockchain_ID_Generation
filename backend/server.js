const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

const touristRoutes = require('./routes/tourist');
const authorityRoutes = require('./routes/authority');
const expirationChecker = require('./services/expirationChecker');

app.use('/api/tourist', touristRoutes);
app.use('/api/authority', authorityRoutes);

// Public verification endpoint (redirect to tourist verify route)
app.use('/api/verify', touristRoutes);

// Health check endpoint for Docker
app.get('/api/tourist/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: Date.now(),
        service: 'tourist-registry-backend',
        expirationChecker: expirationChecker.getStatus()
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Start expiration checker
    setTimeout(() => {
        expirationChecker.start();
        console.log('✅ Automatic expiration checker started');
    }, 5000); // Wait 5 seconds for blockchain to be ready
});