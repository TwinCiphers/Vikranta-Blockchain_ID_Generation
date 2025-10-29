@echo off
echo =========================================
echo Tourist Registry - Docker Setup
echo =========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo Docker is running
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    (
        echo BLOCKCHAIN_PROVIDER=http://blockchain:8545
        echo ENCRYPTION_KEY=4482d1e262fb2c871da06ca46da38545d75016d0b91b362b449f5e59c538b145
        echo PORT=3000
        echo BASE_URL=http://localhost:3000
        echo APP_URL=http://localhost:3000
        echo NODE_ENV=development
        echo MNEMONIC=diesel someone meadow ice fee oppose copper mountain distance law insane duty
    ) > .env
    echo .env file created
) else (
    echo .env file exists
)

echo.
echo Building Docker images...
docker-compose build

echo.
echo Starting blockchain...
docker-compose up -d blockchain

echo.
echo Waiting for blockchain to start (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo Deploying smart contracts...
docker-compose run --rm deployer

echo.
echo Starting backend server...
docker-compose up -d backend

echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo Services Status:
docker-compose ps
echo.
echo Access the application:
echo    Frontend: http://localhost:3000
echo    Register: http://localhost:3000/register.html
echo    Authority: http://localhost:3000/authority-login.html
echo.
echo Useful commands:
echo    View logs:     docker-compose logs -f
echo    Stop all:      docker-compose down
echo    Restart:       docker-compose restart
echo.
pause
