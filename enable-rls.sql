-- =========================================================
-- 🔒  RE-ENABLE RLS (after testing) 🔒
-- =========================================================
-- Run this AFTER you've verified the app works with RLS disabled
-- This will re-enable security for production use

-- Step 1: Re-enable RLS on all tables
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Step 2: Update the helper function to use auth.uid()
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS text AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE;

-- Step 3: Update policies to use auth.uid()

-- BOARDS POLICIES
DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;
CREATE POLICY "Users can view their own boards"
ON public.boards FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own boards" ON public.boards;
CREATE POLICY "Users can insert their own boards"
ON public.boards FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;
CREATE POLICY "Users can update their own boards"
ON public.boards FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;
CREATE POLICY "Users can delete their own boards"
ON public.boards FOR DELETE
USING (user_id = auth.uid());

-- COLUMNS POLICIES
DROP POLICY IF EXISTS "Users can view columns from their own boards" ON public.columns;
CREATE POLICY "Users can view columns from their own boards" ON public.columns
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert columns into their own boards" ON public.columns;
CREATE POLICY "Users can insert columns into their own boards" ON public.columns
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update columns from their own boards" ON public.columns;
CREATE POLICY "Users can update columns from their own boards" ON public.columns
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete columns from their own boards" ON public.columns;
CREATE POLICY "Users can delete columns from their own boards" ON public.columns
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = auth.uid()
  )
);

-- TASKS POLICIES
DROP POLICY IF EXISTS "Users can view tasks from their own boards" ON public.tasks;
CREATE POLICY "Users can view tasks from their own boards" ON public.tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.columns
    JOIN public.boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert tasks into their own boards" ON public.tasks;
CREATE POLICY "Users can insert tasks into their own boards" ON public.tasks
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.columns
    JOIN public.boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update tasks from their own boards" ON public.tasks;
CREATE POLICY "Users can update tasks from their own boards" ON public.tasks
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.columns
    JOIN public.boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.columns
    JOIN public.boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete tasks from their own boards" ON public.tasks;
CREATE POLICY "Users can delete tasks from their own boards" ON public.tasks
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.columns
    JOIN public.boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = auth.uid()
  )
);

-- Step 4: Verify RLS is re-enabled
SELECT 
    'boards' as table_name,
    CASE WHEN relrowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_class
WHERE relname = 'boards'

UNION ALL

SELECT 
    'columns' as table_name,
    CASE WHEN relrowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_class
WHERE relname = 'columns'

UNION ALL

SELECT 
    'tasks' as table_name,
    CASE WHEN relrowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_class
WHERE relname = 'tasks';

-- =========================================================
-- ✅ RLS is now RE-ENABLED with auth.uid()
-- =========================================================
-- Your app should now be secure and working!
-- =========================================================
