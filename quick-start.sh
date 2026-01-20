#!/bin/bash

echo "🚀 Gehad Team - Quick Launch Guide"
echo ""
echo "=========================================="
echo ""
echo "📋 STEP 1: Run SQL in Supabase"
echo "--------------------------------"
echo "Go to Supabase Dashboard → SQL Editor"
echo "Run these scripts in ORDER:"
echo ""
echo "1. supabase-migrations.sql"
echo "   (Creates boards, columns, tasks tables)"
echo ""
echo "2. supabase-migrations-additional.sql"
echo "   (Creates chat, tags, checklists, comments, activities)"
echo ""
echo "3. supabase-storage.sql"
echo "   (Creates file storage bucket)"
echo ""
echo "✅ Press Enter when done..."
read
echo ""
echo "=========================================="
echo "📋 STEP 2: Push to GitHub"
echo "--------------------------------"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
  git init
  echo "✅ Git initialized"
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
  echo "⚠️  No git remote found"
  echo "Please add your GitHub repo:"
  echo "  git remote add origin https://github.com/YOUR_USERNAME/trello-clone-fullstack.git"
  echo ""
  echo "✅ Press Enter when done..."
  read
else
  echo "✅ Git remote found"
fi

echo ""
echo "Adding files..."
git add .

echo "Creating commit..."
git commit -m "Complete Trello clone with all features

- Unlimited boards & tasks
- Real-time team chat
- File upload system
- Tags & labels
- Checklists
- Comments
- Activity log
- Beautiful modern UI
- Production ready"

echo ""
echo "=========================================="
echo "📋 STEP 3: Deploy to Vercel"
echo "--------------------------------"
echo ""
echo "1. Go to: https://vercel.com/new"
echo "2. Click 'Import Project from GitHub'"
echo "3. Select this repository"
echo "4. Add these environment variables:"
echo ""
echo "   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY"
echo "   CLERK_SECRET_KEY=sk_test_YOUR_SECRET"
echo "   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY"
echo ""
echo "5. Click 'Deploy'"
echo ""
echo "✅ Your app will be live in 2-3 minutes!"
echo ""
echo "=========================================="
echo "🎉 DONE!"
echo "=========================================="
echo ""
echo "📖 Documentation:"
echo "  - FEATURES.md - Complete feature guide"
echo "  - DEPLOYMENT.md - Detailed deployment steps"
echo "  - PROJECT_STATUS.md - What's implemented"
echo "  - README.md - Main documentation"
echo ""
echo "🚀 Happy coding!"
