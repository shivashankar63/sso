# Final Fix: No Data in HRMS After Sync

## Problem
Sync shows success but data still not appearing in HRMS database.

## Root Cause Analysis

The issue is likely one of these:

1. **RLS Policies Blocking Writes** (Most Common)
2. **Wrong Supabase Keys** (Anon key might be Clerk key)
3. **Table Doesn't Exist**
4. **Service Key Not Actually Set**

## Step-by-Step Fix

### Step 1: Verify Service Key is Set

Run in **Central Supabase**:
```sql
SELECT 
  name,
  supabase_url,
  CASE WHEN supabase_service_key IS NOT NULL THEN '✅' ELSE '❌' END as service_key
FROM connected_sites
WHERE name = 'hrms';
```

**If ❌:** Run `add-service-key-to-hrms.sql` in Central Supabase

### Step 2: Test Direct Write to HRMS

Run `test-sync-direct-to-hrms.sql` in **HRMS Supabase SQL Editor**

This will:
- Check if table exists
- Check RLS status
- Try to insert a test user
- Verify the insert worked

**If insert fails:** RLS is blocking → Go to Step 3

### Step 3: Fix RLS Policies

Run `fix-hrms-rls-complete.sql` in **HRMS Supabase SQL Editor**

This will:
- Disable RLS completely (easiest)
- OR create ALLOW ALL policy

### Step 4: Verify Supabase Keys

**Important:** The anon key you provided (`sb_publishable_...`) looks like a Clerk key, not Supabase key.

**Get correct Supabase keys:**
1. Go to: https://supabase.com/dashboard/project/snjtkvvmjqizdfyqbyzd
2. Settings → API
3. Copy:
   - **anon/public key** (should start with `eyJ...`)
   - **service_role key** (should start with `eyJ...`)

**Update in Central Supabase:**
```sql
UPDATE connected_sites
SET 
  supabase_anon_key = 'eyJ...',  -- Replace with actual Supabase anon key
  supabase_service_key = 'eyJ...'  -- Replace with actual service key
WHERE name = 'hrms';
```

### Step 5: Test Sync Again

1. **Run debug endpoint:**
   ```
   POST /api/test/debug-sync
   Body: { "email": "your-email@example.com" }
   ```

2. **Check server terminal** for detailed logs

3. **Verify in HRMS:**
   ```sql
   SELECT * FROM public.user_profiles 
   WHERE email = 'your-email@example.com';
   ```

## Quick Checklist

- [ ] Service key set in Central Supabase?
- [ ] RLS disabled or ALLOW ALL policy in HRMS?
- [ ] Correct Supabase keys (not Clerk keys)?
- [ ] `user_profiles` table exists in HRMS?
- [ ] Direct SQL insert works in HRMS?

## Most Likely Fix

**Run these in order:**

1. **HRMS Supabase:** Run `fix-hrms-rls-complete.sql` (disables RLS)
2. **Central Supabase:** Run `add-service-key-to-hrms.sql` (sets service key)
3. **Verify keys:** Make sure you're using Supabase keys, not Clerk keys
4. **Test sync:** Try syncing again

The RLS policies are most likely blocking the writes. Disabling RLS should fix it immediately!
