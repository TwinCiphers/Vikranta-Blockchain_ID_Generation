@echo off
echo ====================================
echo Starting Tourist Registry (Docker)
echo ====================================
echo.

echo [1/4] Stopping any existing containers...
docker-compose down 2>nul

echo.
echo [2/4] Starting blockchain...
docker-compose up -d blockchain

echo.
echo [3/4] Waiting 20 seconds for blockchain...
timeout /t 20 /nobreak >nul

echo.
echo [4/4] Deploying contracts...
docker-compose run --rm --no-deps deployer sh -c "npx truffle migrate --network docker 2>&1"

echo.
echo [5/4] Starting backend...
docker-compose up -d backend

echo.
echo ====================================
echo DONE! Access at http://localhost:3000
echo ====================================
echo.
docker-compose ps
echo.
pause
