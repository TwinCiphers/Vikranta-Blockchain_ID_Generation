# 🎯 Quick Start - Short ID System

## Your Unique ID Format

**NEW FORMAT**: 10 alphanumeric characters
- Example: `fUQKkp6fZq`
- Contains: A-Z, a-z, 0-9
- Length: 7-10 characters

**OLD FORMAT** (no longer used): ❌
- ~~32254698-62e1-4495-b8aa-d09191e254db~~

---

## 🚀 How to Use Your ID

### 1. **Register a New Tourist**
Go to: https://localhost/register.html

After registration, you'll receive:
```
✅ Registration Successful!
Your Unique ID: fUQKkp6fZq

⚠️ SAVE THIS ID - You'll need it to login!
```

### 2. **Login to Dashboard**
Go to: https://localhost/login.html

Enter your 10-character ID:
```
┌─────────────────────────────┐
│ Enter Your Unique ID:       │
│ [fUQKkp6fZq____________]    │
│                             │
│      [Login to Dashboard]   │
└─────────────────────────────┘
```

### 3. **Access Your Dashboard**
After login, you can:
- ✅ View registration status
- ✅ Upload documents
- ✅ Track verification progress
- ✅ Download QR code
- ✅ Download PVC card

---

## 📱 ID Examples

### Valid IDs:
- ✅ `fUQKkp6fZq` (10 chars)
- ✅ `8tD0N9UsA9` (10 chars)
- ✅ `w4tWdF5` (7 chars)
- ✅ `JxwLEnWAyi` (10 chars)

### Invalid IDs:
- ❌ `abc` (too short)
- ❌ `abc-def-123` (contains hyphens)
- ❌ `32254698-62e1-4495-b8aa-d09191e254db` (old UUID format)
- ❌ `test@123!` (special characters not allowed)

---

## 🔑 Important Reminders

1. **Save Your ID Immediately**
   - Write it down or save in password manager
   - You'll need it to access your dashboard
   - Cannot be recovered easily if lost

2. **Case Sensitive**
   - `fUQKkp6fZq` ≠ `fuqkkp6fzq`
   - Copy/paste recommended

3. **Keep It Secure**
   - Don't share publicly
   - Treat like a password
   - Use only on official website

---

## 🌐 Access URLs

| Page | URL |
|------|-----|
| Home | https://localhost/ |
| Register | https://localhost/register.html |
| Login | https://localhost/login.html |
| Dashboard | https://localhost/dashboard.html?uniqueId=YOUR_ID |
| Authority Login | https://localhost/authority-login.html |
| Authority Panel | https://localhost/authority-panel.html |

---

## ⚠️ Browser Security Warning

You'll see "Not Secure" warning because we use self-signed SSL certificate.

**This is NORMAL and SAFE** - Click "Advanced" → "Continue"

The connection is encrypted (HTTPS) but browser doesn't recognize our self-signed certificate.

---

## 🆘 Troubleshooting

### Problem: "Invalid Unique ID format"
**Solution**: Ensure ID is 7-10 alphanumeric characters only

### Problem: "Tourist ID not found"
**Solutions**:
- Double-check spelling (case-sensitive)
- Verify you registered successfully
- Check if backend is running: http://localhost:3000

### Problem: "Cannot connect to server"
**Solution**: Restart Docker containers:
```powershell
docker-compose restart backend nginx
```

---

## 🧪 Test Your ID

Open browser console and paste:
```javascript
// Test your ID format
const myId = 'fUQKkp6fZq'; // Replace with your ID
const isValid = /^[A-Za-z0-9]{7,10}$/.test(myId);
console.log(isValid ? '✅ Valid ID' : '❌ Invalid ID');
```

---

## 📞 Support

- Email: support@touristregistry.com
- Lost ID Recovery: Contact authority panel
- Technical Issues: Check backend logs

---

**System Status**: ✅ All systems operational
**Last Updated**: October 31, 2025
