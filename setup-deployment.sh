#!/bin/bash

echo "🚀 Unit Zero Deployment Setup"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - ready for deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Generate JWT secret if not exists
if [ -z "$JWT_SECRET" ]; then
    echo "🔐 Generating JWT secret..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    echo "JWT_SECRET=$JWT_SECRET" >> .env.local
    echo "✅ JWT secret generated and saved to .env.local"
else
    echo "✅ JWT secret already exists"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Create a GitHub repository"
echo "2. Push your code: git remote add origin <your-repo-url> && git push -u origin main"
echo "3. Go to https://vercel.com and import your repository"
echo "4. Set up a production database (Vercel Postgres recommended)"
echo "5. Configure environment variables in Vercel"
echo "6. Deploy!"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
