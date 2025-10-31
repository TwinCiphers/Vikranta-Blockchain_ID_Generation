# 🔐 Authority Login Guide

## Quick Login (Easiest Method)

**Just open this page in your browser:**
```
https://localhost/quick-authority-login.html
```

Click the "🚀 Login as Authority" button and you'll be automatically logged in!

---

## Manual Login Steps

If you prefer to use the regular login page:

### 1. Open Authority Login Page
```
https://localhost/authority-login.html
```

### 2. Connect Your MetaMask Wallet
- Click "Connect MetaMask Wallet"
- Approve the connection in MetaMask
- Use this authority address: `0x9bBD3535c5582A4b15a529Bb3794688728988D41`

### 3. Enter the Authority Passphrase
```
vikrantaTBS$2025
```

### 4. Click "Verify & Login"

---

## Why Was I Getting "Access Denied"?

The error can happen due to several reasons:
- **Invalid Passphrase**: You entered the wrong passphrase
- **Not an Authority**: Your wallet address isn't registered as an authority in the smart contract
- **Contract Redeployed**: The contract was redeployed and old addresses are no longer valid

**Solution**: 
1. Use the correct passphrase: `vikrantaTBS$2025`
2. Use the deployer address: `0x9bBD3535c5582A4b15a529Bb3794688728988D41`
3. This address is automatically registered as an authority when the contract is deployed

---

## Adding More Authorities

If you want to add more authority addresses:

### Method 1: Use the Script
```bash
node add-authority.js
```

This will show all available accounts and instructions to add new authorities.

### Method 2: Modify the Script
Edit `add-authority.js` and uncomment the code at the bottom:
```javascript
const newAuthority = accounts[1]; // or any address
const tx = await touristRegistryContract.methods
    .addAuthority(newAuthority)
    .send({ from: admin, gas: 3000000 });
```

Then run: `node add-authority.js`

---

## Testing Authority Panel

After logging in, you can:
1. ✅ View pending tourist registrations
2. ✅ Approve tourists (generates QR code)
3. ✅ Reject tourists (marks as inactive on blockchain)
4. ✅ Download PVC cards for approved tourists

---

## Current System Status

**Contract Address**: `0x4c83302C0db7E91d0c5a42604E98650cF5e8c59e`  
**Authority Address**: `0x9bBD3535c5582A4b15a529Bb3794688728988D41`  
**Backend**: http://localhost:3000 ✅  
**Frontend**: https://localhost ✅  
**Blockchain**: http://localhost:9545 ✅  

---

## Quick Links

- **Quick Login**: https://localhost/quick-authority-login.html
- **Regular Login**: https://localhost/authority-login.html
- **Authority Panel**: https://localhost/authority-panel.html
- **Tourist Registration**: https://localhost/register.html
- **Home**: https://localhost/

---

## Troubleshooting

### "Access Denied" Error
✅ **Solution**: Use the quick login page or copy the exact authority address above

### "Session Expired"
✅ **Solution**: Login again. Tokens expire after 24 hours.

### "No Pending Verifications"
✅ **Solution**: Register a test tourist first at https://localhost/register.html

### Contract Address Changed
✅ **Solution**: We've updated the .env file with the new contract address

---

**Last Updated**: October 31, 2025  
**Status**: All systems operational ✅
