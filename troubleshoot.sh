#!/bin/bash

echo "🔍 Gehad Team - Supabase + Clerk Troubleshooting Tool"
echo "=================================================="
echo ""

echo "📋 Checking Environment Variables..."
echo "================================"

# Check .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file exists"
    
    # Check Supabase URL
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_URL is set"
        SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d '=' -f2)
        echo "   URL: $SUPABASE_URL"
    else
        echo "❌ NEXT_PUBLIC_SUPABASE_URL is NOT set"
    fi
    
    # Check Supabase Anon Key
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    else
        echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is NOT set"
    fi
    
    # Check Clerk Keys
    if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local; then
        echo "✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set"
    else
        echo "❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is NOT set"
    fi
    
    if grep -q "CLERK_SECRET_KEY=" .env.local; then
        echo "✅ CLERK_SECRET_KEY is set"
    else
        echo "❌ CLERK_SECRET_KEY is NOT set"
    fi
else
    echo "❌ .env.local file does NOT exist"
    echo "   Please create it with your environment variables"
fi

echo ""
echo "🔑 Checking Database Setup..."
echo "================================"

# Check if database-setup.sql exists
if [ -f database-setup.sql ]; then
    echo "✅ database-setup.sql exists"
    
    # Check for requesting_user_id function
    if grep -q "requesting_user_id" database-setup.sql; then
        echo "✅ requesting_user_id() function is defined"
    else
        echo "❌ requesting_user_id() function is NOT defined"
        echo "   Please add it to your database"
    fi
    
    # Check for RLS policies
    if grep -q "ENABLE ROW LEVEL SECURITY" database-setup.sql; then
        echo "✅ RLS is enabled"
    else
        echo "❌ RLS is NOT enabled"
    fi
else
    echo "❌ database-setup.sql does NOT exist"
fi

echo ""
echo "📝 Next Steps:"
echo "================================"
echo ""
echo "1. Ensure you have configured the JWT Template in Clerk Dashboard"
echo "   - Go to Clerk Dashboard → JWT Templates"
echo "   - Create template named 'supabase'"
echo "   - Add claims: { 'role': 'authenticated', 'user_id': 'https://www.clerk.com/v1/user/{{user.id}}' }"
echo ""
echo "2. Ensure RLS Policies use requesting_user_id() function"
echo "   - Check that policies reference requesting_user_id()"
echo "   - This function extracts user ID from JWT token"
echo ""
echo "3. Test the application"
echo "   - Run: npm run dev"
echo "   - Open browser console (F12)"
echo "   - Log in with Clerk"
echo "   - Check console logs for errors"
echo ""
echo "4. If still having issues:"
echo "   - Temporarily disable RLS: ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;"
echo "   - Test if app works (should confirm RLS is the issue)"
echo "   - Re-enable RLS: ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;"
echo ""
echo "================================"
echo "✅ Troubleshooting complete!"
