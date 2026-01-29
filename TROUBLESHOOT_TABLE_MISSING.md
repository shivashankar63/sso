# Troubleshoot: user_profiles Table Still Missing

## Issue
You ran `site-supabase-schema.sql` but still getting "table doesn't exist" error.

## Common Causes

### 1. Ran Schema in Wrong Supabase ❌
**Most Common Issue!**

- ❌ **Wrong**: Central Dashboard Supabase (`snvyotfofpdkheecupho`)
- ✅ **Correct**: HRMS Supabase (`snjtkvvmjqizdfyqbyzd`)

**Fix**: Make sure you're in the HRMS Supabase database!

### 2. Schema Had Errors
The SQL might have failed silently.

**Check**:
1. Go to HRMS Supabase SQL Editor
2. Run `verify-table-exists.sql`
3. If `table_exists` is `false`, the schema didn't run successfully

**Fix**: Run `site-supabase-schema.sql` again and check for errors

### 3. Table Name Mismatch
The table might be in a different schema.

**Check**:
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'user_profiles';
```

### 4. RLS Policies Blocking
Row Level Security might be blocking the query.

**Fix**: The schema includes RLS policies, but verify they're correct

## Step-by-Step Fix

### Step 1: Verify You're in Correct Supabase
1. Check URL: Should be `snjtkvvmjqizdfyqbyzd` in the URL
2. Go to: https://supabase.com/dashboard/project/snjtkvvmjqizdfyqbyzd

### Step 2: Verify Table Exists
1. Open SQL Editor in HRMS Supabase
2. Run `verify-table-exists.sql`
3. Check if `table_exists` is `true`

### Step 3: If Table Doesn't Exist
1. Run `site-supabase-schema.sql` again
2. Check for any error messages
3. Verify it completed successfully

### Step 4: Test Connection Again
1. Go back to dashboard
2. Click Database icon on HRMS site
3. Click "Test Connection"
4. Should now work!

## Quick Check Commands

Run these in HRMS Supabase SQL Editor:

```sql
-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
);

-- If false, run this to create it:
-- (Copy entire site-supabase-schema.sql and run it)
```

## Still Not Working?

1. **Check Supabase URL**: Make sure you're testing connection to correct database
2. **Check Anon Key**: Verify it's the correct key for HRMS Supabase
3. **Clear browser cache**: Sometimes cached errors persist
4. **Check browser console**: Look for detailed error messages

The connection test will now show more helpful messages!
