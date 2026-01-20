#!/bin/bash

echo "🎯 Gehad Team - Quick Fix for Authentication Error"
echo "=================================================="
echo ""
echo "⚠️  This will DISABLE RLS (Row Level Security)"
echo "   Do NOT use this in production!"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "📝 Copy this SQL and run it in Supabase Dashboard → SQL Editor:"
echo ""
echo "=========================================="
cat << 'EOF'
-- TEMPORARILY DISABLE RLS (DO NOT USE IN PRODUCTION!)
ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- UPDATE THE requesting_user_id() FUNCTION
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS text AS $$
  SELECT NULLIF(
    auth.jwt()->>'sub',
    ''
  )::text;
$$ LANGUAGE SQL STABLE;

-- UPDATE BOARDS POLICIES
DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;
CREATE POLICY "Users can view their own boards"
ON public.boards FOR SELECT
USING (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can insert their own boards" ON public.boards;
CREATE POLICY "Users can insert their own boards"
ON public.boards FOR INSERT
WITH CHECK (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;
CREATE POLICY "Users can update their own boards"
ON public.boards FOR UPDATE
USING (user_id = requesting_user_id())
WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;
CREATE POLICY "Users can delete their own boards"
ON public.boards FOR DELETE
USING (user_id = requesting_user_id());

-- RE-ENABLE RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
EOF
echo "=========================================="
echo ""
echo "✅ Steps:"
echo ""
echo "1. Go to https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Go to SQL Editor"
echo "4. Paste the SQL above"
echo "5. Click 'Run'"
echo "6. Restart your app: npm run dev"
echo ""
echo "🔧 Also configure Clerk JWT Template:"
echo ""
echo "1. Go to https://dashboard.clerk.com"
echo "2. Select your app"
echo "3. Go to JWT Templates → New template"
echo "4. Name: supabase"
echo "5. Add these claims:"
echo ""
echo '{'
echo '  "role": "authenticated",'
echo '  "user_id": "https://www.clerk.com/v1/user/{{user.id}}",'
echo '  "email": "{{user.primaryEmailAddress?.emailAddress}}"'
echo '}'
echo ""
echo "6. Save the template"
echo ""
echo "🚀 Now restart your app and test!"
echo ""
