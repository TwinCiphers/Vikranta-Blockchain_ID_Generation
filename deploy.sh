#!/bin/bash

echo "========================================"
echo "Deploying Tourist Registry Contract"
echo "========================================"
echo ""

echo "Step 1: Compiling and deploying contract..."
npx truffle migrate --reset --network development

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Migration failed!"
    echo "Make sure Truffle develop is running on port 9545"
    exit 1
fi

echo ""
echo "Step 2: Updating frontend ABI..."
node -e "const c=require('./build/contracts/TouristRegistry.json'); require('fs').writeFileSync('./frontend/contract-abi.json', JSON.stringify(c.abi, null, 2));"

echo ""
echo "Step 3: Getting contract address..."
node -e "const c=require('./build/contracts/TouristRegistry.json'); const networks=Object.keys(c.networks); const addr=c.networks[networks[networks.length-1]].address; console.log('New Contract Address: ' + addr); const fs=require('fs'); let env=fs.readFileSync('.env','utf8'); env=env.replace(/CONTRACT_ADDRESS=.*/,'CONTRACT_ADDRESS='+addr); fs.writeFileSync('.env',env);"

echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Restart the backend server"
echo "2. Register a NEW tourist (old IDs are invalid)"
echo ""
