-- =========================================================
-- ⚠️  QUICK FIX: DISABLE RLS TEMPORARILY ⚠️
-- =========================================================
-- This will DISABLE Row Level Security to get the app working
-- DO NOT use this in production!

-- Step 1: Disable RLS on all tables
ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify changes
SELECT 
    'boards' as table_name,
    CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class
WHERE relname = 'boards'

UNION ALL

SELECT 
    'columns' as table_name,
    CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class
WHERE relname = 'columns'

UNION ALL

SELECT 
    'tasks' as table_name,
    CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class
WHERE relname = 'tasks';

-- =========================================================
-- ✅ RLS is now DISABLED. Restart your app!
-- =========================================================
-- Run: npm run dev
-- The app should now work without authentication errors
-- =========================================================
