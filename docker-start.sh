#!/bin/bash

echo "========================================="
echo "Tourist Registry - Docker Setup"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
BLOCKCHAIN_PROVIDER=http://blockchain:8545
ENCRYPTION_KEY=4482d1e262fb2c871da06ca46da38545d75016d0b91b362b449f5e59c538b145
PORT=3000
BASE_URL=http://localhost:3000
APP_URL=http://localhost:3000
NODE_ENV=development
MNEMONIC=diesel someone meadow ice fee oppose copper mountain distance law insane duty
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file exists"
fi

echo ""
echo "Building Docker images..."
docker-compose build

echo ""
echo "Starting services..."
docker-compose up -d blockchain

echo ""
echo "Waiting for blockchain to start (30 seconds)..."
sleep 30

echo ""
echo "Deploying smart contracts..."
docker-compose run --rm deployer

echo ""
echo "Starting backend server..."
docker-compose up -d backend

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "📋 Services Status:"
docker-compose ps
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Register: http://localhost:3000/register.html"
echo "   Authority: http://localhost:3000/authority-login.html"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop all:      docker-compose down"
echo "   Restart:       docker-compose restart"
echo "   View backend:  docker-compose logs -f backend"
echo ""
