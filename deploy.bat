@echo off
echo ========================================
echo Deploying Tourist Registry Contract
echo ========================================
echo.

echo Step 1: Compiling and deploying contract...
call npx truffle migrate --reset --network development

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Migration failed!
    echo Make sure Truffle develop is running on port 9545
    pause
    exit /b 1
)

echo.
echo Step 2: Updating frontend ABI...
node -e "const c=require('./build/contracts/TouristRegistry.json'); require('fs').writeFileSync('./frontend/contract-abi.json', JSON.stringify(c.abi, null, 2));"

echo.
echo Step 3: Getting contract address...
node -e "const c=require('./build/contracts/TouristRegistry.json'); const networks=Object.keys(c.networks); const addr=c.networks[networks[networks.length-1]].address; console.log('CONTRACT_ADDRESS=' + addr); require('fs').writeFileSync('.env.contract', 'CONTRACT_ADDRESS=' + addr);"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check the CONTRACT_ADDRESS above
echo 2. Update your .env file with the new address
echo 3. Restart the backend server
echo 4. Register a NEW tourist (old IDs are invalid)
echo.
pause
