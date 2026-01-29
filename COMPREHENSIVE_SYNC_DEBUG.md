# Comprehensive Sync Debugging Guide

## Problem: Sync Shows Success But No Data in HRMS

## Step 1: Run Debug Sync Endpoint

**POST** to: `http://localhost:3000/api/test/debug-sync`
**Body:**
```json
{
  "email": "your-email@example.com"
}
```

This will show **detailed step-by-step** what's happening:
- ✅ Step 1: Get user from central
- ✅ Step 2: Get HRMS site config
- ✅ Step 3: Create HRMS client
- ✅ Step 4: Check if table exists
- ✅ Step 5: Write user
- ✅ Step 6: Verify write

**Look for errors at each step!**

## Step 2: Check Server Terminal Logs

When you sync, check terminal for:
```
🔌 Creating Supabase client for hrms...
   Using: Service Key (bypasses RLS)  ← Should see this!
💾 Syncing user_profiles to hrms...
✅ User profile synced to hrms: ...
🔍 Verifying write to hrms...
✅ VERIFICATION SUCCESS: User confirmed in hrms database
```

**If you see:**
```
❌ VERIFICATION FAILED: User not found after sync!
```

This means:
- Write appeared to succeed
- But data is not actually in database
- **Most likely: RLS policies blocking**

## Step 3: Verify Service Key is Actually Set

Run in **Central Supabase**:
```sql
SELECT 
  name,
  supabase_url,
  CASE WHEN supabase_anon_key IS NOT NULL THEN '✅' ELSE '❌' END as anon_key,
  CASE WHEN supabase_service_key IS NOT NULL THEN '✅' ELSE '❌' END as service_key
FROM connected_sites
WHERE name = 'hrms';
```

**If service_key is ❌:**
- Run `add-service-key-to-hrms.sql` in Central Supabase
- Or add via dashboard UI

## Step 4: Check HRMS Database Directly

Run in **HRMS Supabase**:
```sql
-- Check if user_profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
);

-- Check if user exists
SELECT * FROM public.user_profiles 
WHERE email = 'your-email@example.com';

-- Check RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';
```

## Step 5: Test Direct Write

Run in **HRMS Supabase SQL Editor**:
```sql
-- Try inserting directly
INSERT INTO public.user_profiles (
  id, email, full_name, password_hash, role
) VALUES (
  'test_123',
  'test@example.com',
  'Test User',
  'test123',
  'user'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Verify it was inserted
SELECT * FROM public.user_profiles WHERE id = 'test_123';
```

**If this works but sync doesn't:**
- Issue is with API/Supabase client
- Check service key is correct
- Check database URL is correct

## Common Issues & Fixes

### Issue 1: Service Key Not Actually Set
**Symptom:** Sync fails verification
**Fix:** Run `add-service-key-to-hrms.sql` in Central Supabase

### Issue 2: Wrong Database URL
**Symptom:** Write succeeds but to wrong database
**Fix:** Verify HRMS Supabase URL in dashboard matches actual HRMS project

### Issue 3: RLS Still Blocking
**Symptom:** Service key set but still fails
**Fix:** 
```sql
-- Run in HRMS Supabase
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
```

### Issue 4: Table Doesn't Exist
**Symptom:** Error "relation does not exist"
**Fix:** Run `hrms-ensure-user-profiles.sql` in HRMS Supabase

### Issue 5: Wrong Table Schema
**Symptom:** Write fails with column error
**Fix:** Ensure `user_profiles` table has correct columns (id TEXT, email TEXT, etc.)

## Quick Diagnostic Checklist

- [ ] Service key added to HRMS site config?
- [ ] HRMS Supabase URL is correct?
- [ ] `user_profiles` table exists in HRMS?
- [ ] RLS policies allow writes?
- [ ] User exists in central database?
- [ ] Password is set for user?

## Next Steps

1. **Run debug endpoint** - See detailed steps
2. **Check terminal logs** - Look for errors
3. **Verify service key** - Make sure it's actually set
4. **Test direct write** - See if manual insert works
5. **Check RLS policies** - Disable if needed

The debug endpoint will tell you exactly where it's failing!
