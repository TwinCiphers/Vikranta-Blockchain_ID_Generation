# Security Enhancement Guide for Blockchain Tourist Registry

## 🛡️ Current Security Assessment

### ✅ Already Implemented:
- Blockchain immutability (tamper-proof records)
- SHA-256 cryptographic hashing
- AES-256 encryption
- UUID-based authentication
- IPFS decentralized storage
- Docker containerization

### ⚠️ Gaps to Address:
- No rate limiting
- CORS wide open (allows all origins)
- No firewall configuration
- No input validation/sanitization
- No HTTPS/SSL encryption
- Exposed environment variables
- No authentication tokens
- No request validation
- No SQL injection protection
- No DDoS protection

---

## 🔒 Security Enhancements to Implement

### 1. **Rate Limiting & DDoS Protection**

#### Install Dependencies:
```bash
npm install express-rate-limit helmet express-validator
```

#### Implementation:
```javascript
// backend/middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiter for API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for authentication
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 login attempts per 15 minutes
    skipSuccessfulRequests: true,
});

// Strict limiter for registration
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Only 3 registrations per hour per IP
});

module.exports = { apiLimiter, authLimiter, registerLimiter, helmet };
```

---

### 2. **Input Validation & Sanitization**

```javascript
// backend/middleware/validators.js
const { body, param, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Tourist registration validation
const validateRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must contain only letters and spaces'),
    body('nationality')
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Invalid nationality'),
    body('passportNumber')
        .trim()
        .isLength({ min: 6, max: 20 })
        .matches(/^[A-Z0-9]+$/)
        .withMessage('Invalid passport number format'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    body('phone')
        .isMobilePhone()
        .withMessage('Invalid phone number'),
    validate
];

// UUID validation
const validateUUID = [
    param('uniqueId')
        .isUUID(4)
        .withMessage('Invalid unique ID format'),
    validate
];

module.exports = { validateRegistration, validateUUID, validate };
```

---

### 3. **CORS Configuration (Security Hardening)**

```javascript
// backend/middleware/corsConfig.js
const cors = require('cors');

const corsOptions = {
    origin: function (origin, callback) {
        // Whitelist of allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'https://yourdomain.com', // Production domain
            // Add your production URLs
        ];
        
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = corsOptions;
```

---

### 4. **Helmet.js Security Headers**

```javascript
// In server.js
const helmet = require('helmet');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: 'same-origin' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true
}));
```

---

### 5. **JWT Authentication for API**

```bash
npm install jsonwebtoken bcrypt
```

```javascript
// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Generate token
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: '24h',
        issuer: 'vikranta-tourism'
    });
}

// Verify token middleware
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
}

// Role-based access
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
}

module.exports = { generateToken, verifyToken, authorizeRole };
```

---

### 6. **SQL Injection & XSS Protection**

```javascript
// backend/middleware/sanitizer.js
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeInput(req, res, next) {
    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = DOMPurify.sanitize(req.body[key].trim());
            }
        });
    }
    
    // Sanitize query params
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = DOMPurify.sanitize(req.query[key].trim());
            }
        });
    }
    
    next();
}

module.exports = sanitizeInput;
```

---

### 7. **Docker Security Hardening**

```yaml
# docker-compose.yml (security enhanced)
version: '3.8'

services:
  blockchain:
    image: trufflesuite/ganache:latest
    container_name: tourist-blockchain
    ports:
      - "127.0.0.1:9545:8545"  # Bind to localhost only
    environment:
      - MNEMONIC=${BLOCKCHAIN_MNEMONIC}
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp
    networks:
      - blockchain-network
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: tourist-backend
    ports:
      - "127.0.0.1:3000:3000"  # Bind to localhost only
    environment:
      - NODE_ENV=production
      - BLOCKCHAIN_PROVIDER=http://blockchain:8545
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    user: "node"  # Run as non-root user
    networks:
      - blockchain-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/tourist/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

networks:
  blockchain-network:
    driver: bridge
    internal: false
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

### 8. **Environment Variables Security**

```bash
# .env.example (template - never commit actual .env)
NODE_ENV=production
PORT=3000

# Blockchain Configuration
BLOCKCHAIN_PROVIDER=http://blockchain:8545
CONTRACT_ADDRESS=

# Security Keys (GENERATE NEW ONES!)
JWT_SECRET=GENERATE_A_STRONG_SECRET_HERE
ENCRYPTION_KEY=GENERATE_256_BIT_KEY_HERE
BLOCKCHAIN_MNEMONIC=GENERATE_NEW_MNEMONIC

# URLs
BASE_URL=http://localhost:3000
APP_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### 9. **Nginx Reverse Proxy with Firewall**

```nginx
# nginx.conf
upstream backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    # DDoS Protection
    client_body_timeout 10s;
    client_header_timeout 10s;
    keepalive_timeout 5s 5s;
    send_timeout 10s;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 10. **Firewall Configuration (Ubuntu/Debian)**

```bash
# UFW Firewall Setup
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change 22 to your SSH port)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose

# Fail2Ban for brute force protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📋 Updated server.js with Security

```javascript
const express = require('express');
const path = require('path');
require('dotenv').config();

// Security imports
const helmet = require('helmet');
const { apiLimiter, authLimiter } = require('./middleware/security');
const corsOptions = require('./middleware/corsConfig');
const sanitizeInput = require('./middleware/sanitizer');

const app = express();

// Security middleware (MUST BE FIRST)
app.use(helmet());
app.use(require('cors')(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
const touristRoutes = require('./routes/tourist');
const authorityRoutes = require('./routes/authority');

app.use('/api/tourist', touristRoutes);
app.use('/api/authority', authorityRoutes);

// Health check (no rate limit)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🛡️  Secure server running on port ${PORT}`);
});
```

---

## 🚀 Implementation Priority

### **Phase 1: Immediate (Critical)**
1. ✅ Install and configure Helmet.js
2. ✅ Add rate limiting
3. ✅ Fix CORS configuration
4. ✅ Add input validation

### **Phase 2: Short-term (Important)**
5. ✅ Implement JWT authentication
6. ✅ Add request sanitization
7. ✅ Docker security hardening
8. ✅ Environment variable protection

### **Phase 3: Medium-term (Recommended)**
9. ✅ Set up Nginx reverse proxy
10. ✅ Configure UFW firewall
11. ✅ Install Fail2Ban
12. ✅ Add SSL/TLS certificates (Let's Encrypt)

### **Phase 4: Long-term (Advanced)**
13. ✅ Web Application Firewall (WAF)
14. ✅ Intrusion Detection System (IDS)
15. ✅ Security monitoring & logging
16. ✅ Regular security audits

---

## 📊 Security Checklist

- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Helmet.js security headers
- [ ] Input validation on all endpoints
- [ ] JWT authentication
- [ ] XSS protection
- [ ] SQL injection protection
- [ ] Docker security hardened
- [ ] Environment variables secured
- [ ] Firewall configured
- [ ] SSL/TLS enabled
- [ ] Fail2Ban installed
- [ ] Regular backups
- [ ] Security monitoring

---

Would you like me to implement any of these security features for your project?
