# 🐳 Docker Quick Reference

## 🚀 Start Everything
```bash
# Windows
docker-start.bat

# Linux/Mac
chmod +x docker-start.sh
./docker-start.sh
```

## 📊 Common Commands

### Status & Logs
```bash
docker-compose ps                    # Check status
docker-compose logs -f               # View all logs
docker-compose logs -f backend       # View backend logs
docker-compose logs -f blockchain    # View blockchain logs
```

### Control Services
```bash
docker-compose up -d                 # Start all services
docker-compose down                  # Stop all services
docker-compose restart               # Restart all services
docker-compose restart backend       # Restart backend only
```

### Management
```bash
docker-compose build                 # Rebuild images
docker-compose down -v               # Stop and remove volumes
docker exec -it tourist-backend sh   # Access backend shell
```

## 🌐 URLs
- **Frontend:** http://localhost:3000
- **Register:** http://localhost:3000/register.html
- **Authority Login:** http://localhost:3000/authority-login.html
- **Dashboard:** http://localhost:3000/dashboard.html?uniqueId=YOUR_ID

## 🔧 Troubleshooting
```bash
# Reset everything
docker-compose down -v
docker-compose build --no-cache
./docker-start.sh

# Check contract address
docker exec tourist-backend cat .env | grep CONTRACT_ADDRESS

# Redeploy contract
docker-compose run --rm deployer
docker-compose restart backend
```

## 📦 Containers
- `tourist-blockchain` - Ganache (Port 9545)
- `tourist-backend` - Express API (Port 3000)
- `tourist-deployer` - Contract deployer (runs once)

## 🔑 MetaMask Setup
- **RPC:** http://localhost:9545
- **Chain ID:** 5777
- **Mnemonic:** diesel someone meadow ice fee oppose copper mountain distance law insane duty
