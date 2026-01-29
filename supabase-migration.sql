-- ============================================
-- Supabase Migration for Clerk SSO Integration
-- ============================================
-- Run this SQL in ALL 4 of your Supabase projects
-- (HRMS, CMS, Sales Portal, Garage)
--
-- IMPORTANT: Before running this, make sure you've updated
-- the JWT Secret in Project Settings > API to match Clerk's JWT Secret
-- ============================================

-- Function to extract user ID from Clerk JWT token
-- This function reads the 'sub' claim from the JWT token
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS text AS $$
SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id() TO anon;

-- ============================================
-- Example RLS Policies
-- ============================================
-- Update these examples to match your actual table names and columns

-- Example 1: Users table - users can only see their own record
-- DROP POLICY IF EXISTS "Users can see own profile" ON users;
-- CREATE POLICY "Users can see own profile"
--   ON users
--   FOR SELECT
--   USING (get_user_id() = id::text);

-- Example 2: Documents table - users can see documents they own
-- DROP POLICY IF EXISTS "Users can see own documents" ON documents;
-- CREATE POLICY "Users can see own documents"
--   ON documents
--   FOR SELECT
--   USING (get_user_id() = user_id::text);

-- Example 3: Insert policy - users can only insert with their own ID
-- DROP POLICY IF EXISTS "Users can insert own data" ON your_table;
-- CREATE POLICY "Users can insert own data"
--   ON your_table
--   FOR INSERT
--   WITH CHECK (get_user_id() = user_id::text);

-- Example 4: Update policy - users can only update their own data
-- DROP POLICY IF EXISTS "Users can update own data" ON your_table;
-- CREATE POLICY "Users can update own data"
--   ON your_table
--   FOR UPDATE
--   USING (get_user_id() = user_id::text)
--   WITH CHECK (get_user_id() = user_id::text);

-- Example 5: Delete policy - users can only delete their own data
-- DROP POLICY IF EXISTS "Users can delete own data" ON your_table;
-- CREATE POLICY "Users can delete own data"
--   ON your_table
--   FOR DELETE
--   USING (get_user_id() = user_id::text);

-- ============================================
-- Testing the Function
-- ============================================
-- After setting up Clerk and updating JWT Secret, you can test:
-- SELECT get_user_id();
-- This should return the Clerk user ID when authenticated

-- ============================================
-- Notes
-- ============================================
-- 1. Replace 'user_id' with your actual column name that stores Clerk user IDs
-- 2. The function returns text, so cast your ID column to text for comparison
-- 3. Make sure RLS is enabled on your tables: ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
-- 4. Test policies with: EXPLAIN SELECT * FROM your_table;
