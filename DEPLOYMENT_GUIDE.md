# 🚀 Complete Deployment Guide to Vercel

This guide will walk you through deploying your educational management system to Vercel with a production database.

## 📋 Prerequisites

- Your project is ready (✅ Done)
- Git repository (we'll set this up)
- Vercel account (we'll create this)
- Database provider account (we'll use Vercel Postgres)

## 🗄️ Step 1: Set Up Production Database

### Option A: Vercel Postgres (Recommended - Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Click "Sign Up" or "Log In"
   - Sign up with GitHub (recommended) or email

2. **Create a New Project**
   - Click "New Project"
   - Connect your GitHub account
   - Import your repository (we'll set this up in Step 2)

3. **Add Vercel Postgres**
   - In your project dashboard, go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name (e.g., "unit-zero-db")
   - Select region closest to your users
   - Click "Create"

4. **Get Database Connection String**
   - Copy the `DATABASE_URL` from the database settings
   - Save this for later use

### Option B: Railway (Alternative)

1. **Go to Railway**
   - Visit: https://railway.app
   - Sign up with GitHub
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Copy the `DATABASE_URL`

## 🔧 Step 2: Prepare Your Project

### 2.1 Initialize Git Repository

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name it "unit-zero" or similar
4. Make it public or private (your choice)
5. Don't initialize with README (we already have files)
6. Click "Create repository"

### 2.3 Push to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/unit-zero.git

# Push your code
git branch -M main
git push -u origin main
```

## 🚀 Step 3: Deploy to Vercel

### 3.1 Connect Repository

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select "unit-zero" repository
5. Click "Import"

### 3.2 Configure Environment Variables

In Vercel project settings, add these environment variables:

```
DATABASE_URL=your_production_database_url_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
```

**To generate JWT_SECRET:**
```bash
# Run this command to generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.3 Configure Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (5-10 minutes)
3. Your app will be available at: `https://your-project-name.vercel.app`

## 📊 Step 4: Migrate Your Data

### 4.1 Update Database Schema

```bash
# Set production database URL
export DATABASE_URL="your_production_database_url"

# Generate Prisma client for production
npx prisma generate

# Run migrations
npx prisma db push
```

### 4.2 Migrate Your Data

We'll create a script to migrate all your existing data:

```bash
# Run the data migration script
npm run migrate-to-production
```

## 🔗 Step 5: Connect Custom Domain (Optional)

### 5.1 Buy Domain (if you haven't)

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Buy your desired domain
3. Note the domain management settings

### 5.2 Configure in Vercel

1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your domain
4. Follow DNS configuration instructions
5. Update your domain's DNS settings as instructed

## ✅ Step 6: Verify Deployment

1. **Test Admin Login**
   - Go to `https://your-domain.com/login`
   - Login with admin credentials
   - Verify all features work

2. **Test Student Access**
   - Create a test student account
   - Verify course access and quiz functionality

3. **Test Teacher Features**
   - Login as teacher
   - Verify course management and quiz scoring

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check DATABASE_URL is correct
   - Ensure database is accessible from Vercel

2. **Build Failures**
   - Check all dependencies are in package.json
   - Verify TypeScript compilation

3. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly

### Getting Help:

- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions

## 📱 Final Checklist

- [ ] Database set up and connected
- [ ] Code pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] Environment variables configured
- [ ] Data migrated successfully
- [ ] All features tested
- [ ] Custom domain connected (optional)
- [ ] SSL certificate active (automatic with Vercel)

## 🎉 You're Live!

Your educational management system is now live and accessible to students, teachers, and administrators worldwide!

**Next Steps:**
- Monitor usage and performance
- Set up backups for your database
- Consider adding analytics
- Plan for scaling as your user base grows
