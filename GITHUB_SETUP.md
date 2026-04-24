# 📦 GitHub Repository Setup Guide

Follow these steps to create your GitHub repository and push your code.

## Step 1: Create GitHub Repository

1. **Go to GitHub**: Open https://github.com in your browser
2. **Sign in** with your account (ashok9447)
3. **Create New Repository**:
   - Click the **"+"** icon in the top-right corner
   - Select **"New repository"**

4. **Fill in Repository Details**:
   - **Repository name**: `parking-system`
   - **Description**: `Real-time parking management system for Lulu Cyber Tower 2`
   - **Visibility**: Choose **Public** (so you can deploy on Render free tier)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. **Click "Create repository"**

## Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. **IGNORE THOSE** and use these instead:

### Copy and run this command in your terminal:

```bash
git remote add origin https://github.com/ashok9447/parking-system.git
```

### Then push your code:

```bash
git push -u origin main
```

**Note**: You may be asked to authenticate. If so:

- **Username**: ashok9447
- **Password**: Use a Personal Access Token (not your GitHub password)

### If you need to create a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `parking-system-deploy`
4. Select scopes: Check **"repo"** (full control of private repositories)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

## Step 3: Verify Upload

1. Go to: https://github.com/ashok9447/parking-system
2. You should see all your files uploaded
3. Check that these files are present:
   - ✅ README.md
   - ✅ DEPLOYMENT_GUIDE.md
   - ✅ backend/ folder
   - ✅ frontend/ folder
   - ✅ render.yaml

## Step 4: Next Steps - Deploy to Render

Once your code is on GitHub, follow the **DEPLOYMENT_GUIDE.md** to deploy to Render!

Quick link: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## Troubleshooting

### Problem: "Authentication failed"

**Solution**: Use a Personal Access Token instead of your password (see above)

### Problem: "Repository already exists"

**Solution**:

```bash
git remote remove origin
git remote add origin https://github.com/ashok9447/parking-system.git
git push -u origin main
```

### Problem: "Permission denied"

**Solution**: Make sure you're logged into the correct GitHub account

---

## Quick Commands Reference

```bash
# Check current remote
git remote -v

# Remove remote if needed
git remote remove origin

# Add remote
git remote add origin https://github.com/ashok9447/parking-system.git

# Push to GitHub
git push -u origin main

# Check status
git status
```

---

**Ready to push?** Run the commands in Step 2! 🚀
