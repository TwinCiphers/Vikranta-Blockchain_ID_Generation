# QR Code & PVC Card Features

## ✅ Updated Features

### QR Code Data Structure
When you scan a QR code from a verified tourist, it now includes:
```json
{
  "uniqueId": "tourist-unique-id",
  "timestamp": 1234567890,
  "verificationUrl": "http://localhost:3000/verify/tourist-unique-id",
  "validTill": "2025-12-31T23:59:59.000Z",
  "isVerified": true
}
```

**New Fields:**
- ✅ `validTill` - ISO date string showing when the verification expires
- ✅ `isVerified` - Boolean indicating verification status

### PVC Card Information
The professional government-style PVC card displays:

**Front Side:**
- ✅ Government header with official styling
- ✅ Tourist full name (uppercase)
- ✅ Nationality
- ✅ Unique ID number (monospace font)
- ✅ **ISSUE DATE** - When the tourist was verified
- ✅ **VALID UNTIL** - Expiration date of verification
- ✅ QR Code with gold border (includes all tourist data)
- ✅ "SCAN TO VERIFY" label
- ✅ Security strip with blockchain verification markers
- ✅ Hologram indicators

**QR Code on PVC Card Contains:**
```json
{
  "uniqueId": "tourist-unique-id",
  "name": "Tourist Name",
  "nationality": "Country",
  "qrCodeHash": "QR_reference_hash",
  "verifyUrl": "http://localhost:3000/verify/QR_hash",
  "issuedDate": "Jan 15, 2025",
  "expiryDate": "Jan 15, 2026"
}
```

## How It Works

### For Tourists:
1. Register on the system
2. Upload required documents
3. Wait for authority verification
4. Authority approves with validity period (30 days to 5 years)
5. Download PVC card with QR code containing expiration date
6. Use QR code for verification - scanners can see the valid till date

### For Authorities:
1. View pending verifications
2. Select validity period when approving:
   - 30 days
   - 90 days (3 months)
   - 180 days (6 months)
   - 365 days (1 year)
   - 730 days (2 years)
   - 1095 days (3 years)
   - 1825 days (5 years)
3. Approve - system automatically calculates expiration date
4. Tourist receives verified status with expiration tracking

### For Verifiers (Scanning QR):
1. Scan the QR code
2. Parse the JSON data
3. Check `validTill` field against current date
4. Verify `isVerified` is true
5. Access `verificationUrl` for full blockchain verification

## Color Scheme (Government Style)
- **Deep Blue:** #0f172a, #1e40af, #1e3a8a (Official/Professional)
- **Gold Accents:** #fbbf24 (Authority/Premium)
- **White Text:** #ffffff (Contrast)
- **Card Size:** CR80 (243x153 points - standard credit card size)

## Security Features
- ✅ Blockchain verification
- ✅ Expiration date tracking
- ✅ QR code with error correction level H (30% recovery)
- ✅ Unique ID in monospace font for easy verification
- ✅ Tamper-proof design
- ✅ Professional government styling
- ✅ Security strip with hologram indicators
