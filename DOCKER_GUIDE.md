# 🐳 Docker Deployment Guide

## Prerequisites
- Docker Desktop installed
- Docker Compose installed
- At least 4GB RAM available
- Ports 3000 and 9545 available

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```cmd
docker-start.bat
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Option 2: Manual Setup

1. **Build images:**
```bash
docker-compose build
```

2. **Start blockchain:**
```bash
docker-compose up -d blockchain
```

3. **Wait 30 seconds for blockchain to initialize**

4. **Deploy contracts:**
```bash
docker-compose run --rm deployer
```

5. **Start backend:**
```bash
docker-compose up -d backend
```

6. **Access application:**
- Frontend: http://localhost:3000
- Register: http://localhost:3000/register.html
- Authority Panel: http://localhost:3000/authority-login.html

## Container Architecture

### Services

1. **blockchain** (Ganache)
   - Port: 9545 (mapped from container's 8545)
   - Network ID: 5777
   - Pre-funded accounts: 10
   - Balance per account: 100 ETH

2. **backend** (Node.js/Express)
   - Port: 3000
   - Serves API and frontend
   - Auto-restart on failure

3. **deployer** (One-time)
   - Deploys smart contracts
   - Updates .env with contract address
   - Exits after completion

## Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Blockchain only
docker-compose logs -f blockchain
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart backend only
docker-compose restart backend
```

### Check Status
```bash
docker-compose ps
```

### Access Container Shell
```bash
# Backend container
docker exec -it tourist-backend sh

# Blockchain container
docker exec -it tourist-blockchain sh
```

## Environment Variables

Create `.env` file in project root:
```env
BLOCKCHAIN_PROVIDER=http://blockchain:8545
CONTRACT_ADDRESS=0xYourContractAddress
ENCRYPTION_KEY=4482d1e262fb2c871da06ca46da38545d75016d0b91b362b449f5e59c538b145
PORT=3000
BASE_URL=http://localhost:3000
APP_URL=http://localhost:3000
NODE_ENV=development
MNEMONIC=diesel someone meadow ice fee oppose copper mountain distance law insane duty
```

## Troubleshooting

### Blockchain not connecting
```bash
# Check if blockchain is running
docker-compose ps blockchain

# View blockchain logs
docker-compose logs blockchain

# Restart blockchain
docker-compose restart blockchain
```

### Contract deployment failed
```bash
# Re-run deployer
docker-compose run --rm deployer

# Check deployer logs
docker-compose logs deployer
```

### Backend errors
```bash
# View backend logs
docker-compose logs -f backend

# Restart backend
docker-compose restart backend

# Check if contract address is set
docker exec tourist-backend cat .env
```

### Port already in use
```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :3000

# Change port in docker-compose.yml:
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Reset Everything
```bash
# Stop and remove all containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
./docker-start.sh  # or docker-start.bat
```

## Production Deployment

### Using Docker Hub

1. **Build and tag images:**
```bash
docker build -f Dockerfile.backend -t yourusername/tourist-backend:latest .
docker build -f Dockerfile.deployer -t yourusername/tourist-deployer:latest .
```

2. **Push to Docker Hub:**
```bash
docker push yourusername/tourist-backend:latest
docker push yourusername/tourist-deployer:latest
```

3. **Update docker-compose.yml:**
```yaml
backend:
  image: yourusername/tourist-backend:latest
  # Remove build section
```

### Environment-Specific Configs

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  backend:
    environment:
      - NODE_ENV=production
      - BLOCKCHAIN_PROVIDER=https://your-production-rpc-url
```

Deploy:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Health Checks

All services have health checks configured:

- **Blockchain:** Checks port 8545 availability
- **Backend:** Checks /api/tourist/health endpoint

View health status:
```bash
docker-compose ps
```

## Volumes

Data persistence (optional):
```yaml
volumes:
  - blockchain-data:/app/data
```

## Network Architecture

```
┌─────────────────────────────────────┐
│         Docker Network              │
│                                     │
│  ┌──────────┐      ┌──────────┐   │
│  │Blockchain│◄─────┤ Backend  │   │
│  │(Ganache) │      │(Express) │   │
│  │  :8545   │      │  :3000   │   │
│  └──────────┘      └──────────┘   │
│       ▲                  ▲         │
│       │                  │         │
│  ┌────┴─────┐            │         │
│  │ Deployer │            │         │
│  │(One-time)│            │         │
│  └──────────┘            │         │
└──────────────────────────┼─────────┘
                           │
                      Host :3000
                   (Your Browser)
```

## MetaMask Configuration

When using Docker, configure MetaMask:

1. **Network Name:** Local Blockchain (Docker)
2. **RPC URL:** http://localhost:9545
3. **Chain ID:** 5777
4. **Currency Symbol:** ETH

Import account using mnemonic:
```
diesel someone meadow ice fee oppose copper mountain distance law insane duty
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify services: `docker-compose ps`
3. Check environment: `docker exec tourist-backend env`
4. Restart services: `docker-compose restart`
