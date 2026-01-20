#!/bin/bash

# Clean build script - fixes Next.js cache issues

echo "🧹 Cleaning Next.js cache..."

# Remove .next directory
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Removed .next directory"
fi

# Remove node_modules/.cache if exists
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Removed node_modules/.cache"
fi

echo "✨ Cache cleaned successfully!"
echo ""
echo "Now run: npm run dev or npm run build"
