# GitHub Setup Guide

## Step-by-Step Guide to Upload Your Blockchain Project to GitHub

### Prerequisites
- Git installed on your system
- GitHub account created
- Project is working locally

---

## 1️⃣ Initialize Git Repository

Open PowerShell in your project directory and run:

```powershell
# Navigate to your project
cd C:\Users\dk-32\Videos\blockchain

# Initialize git repository
git init

# Check git status
git status
```

---

## 2️⃣ Create Repository on GitHub

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in the details:
   - **Repository name**: `blockchain-tourist-registry` (or your choice)
   - **Description**: "Blockchain-based Tourist Registration System with PVC Card Generation"
   - **Visibility**: Choose **Public** or **Private**
   - **DON'T** initialize with README (we already have one)
4. Click **"Create repository"**

---

## 3️⃣ Add Files to Git

```powershell
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status

# Commit with a message
git commit -m "Initial commit: Blockchain Tourist Registry System"
```

---

## 4️⃣ Connect to GitHub Repository

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values:

```powershell
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify remote
git remote -v
```

---

## 5️⃣ Push to GitHub

```powershell
# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use **Personal Access Token** (not password)

---

## 6️⃣ Create Personal Access Token (if needed)

1. Go to GitHub → Settings → Developer settings
2. Click **"Personal access tokens"** → **"Tokens (classic)"**
3. Click **"Generate new token (classic)"**
4. Set scopes: `repo` (full control)
5. Copy the token and use it as password

---

## 7️⃣ Verify Upload

Go to your GitHub repository URL:
```
https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
```

You should see all your files!

---

## 📦 Repository Structure

Your GitHub repo will contain:
```
blockchain-tourist-registry/
├── backend/              # Node.js backend server
├── frontend/             # HTML/CSS/JS frontend
├── contracts/            # Solidity smart contracts
├── migrations/           # Truffle migrations
├── build/                # Compiled contracts (gitignored)
├── docker-compose.yml    # Docker setup
├── Dockerfile.backend    # Backend container
├── Dockerfile.deployer   # Deployer container
├── package.json          # Dependencies
├── truffle-config.js     # Truffle configuration
├── README.md             # Project documentation
├── SETUP_GUIDE.md        # Setup instructions
├── .gitignore            # Git ignore rules
└── logo.png              # Project logo
```

---

## 🔄 Future Updates

After making changes:

```powershell
# Check what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

---

## 🌿 Working with Branches (Optional)

```powershell
# Create new branch
git checkout -b feature-name

# Make changes and commit
git add .
git commit -m "Add feature"

# Push branch
git push -u origin feature-name

# Switch back to main
git checkout main

# Merge branch
git merge feature-name
```

---

## 🚀 Clone Your Repository (For Others)

Anyone can clone your repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
npm install
docker-compose up -d
```

---

## 📝 Important Notes

1. **Never commit sensitive data**:
   - Private keys
   - API keys
   - Passwords
   - `.env` files

2. **Already gitignored**:
   - `node_modules/`
   - `.env`
   - Test PDF files
   - Build artifacts

3. **Keep README updated** with:
   - Installation instructions
   - Usage guide
   - Features list
   - Screenshots

---

## 🆘 Common Issues

### Push Rejected
```powershell
# Pull latest changes first
git pull origin main --rebase
git push
```

### Wrong Remote URL
```powershell
# Remove wrong remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/USERNAME/REPO.git
```

### Large Files Error
```powershell
# Remove large files from git
git rm --cached large-file.pdf
git commit -m "Remove large file"
git push
```

---

## ✅ Next Steps

1. Add badges to README (build status, license, etc.)
2. Create GitHub Actions for CI/CD
3. Add CONTRIBUTING.md for contributors
4. Create GitHub Issues for bug tracking
5. Set up GitHub Projects for task management

---

## 📞 Support

For help with GitHub:
- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)

Your project is now ready for GitHub! 🎉
