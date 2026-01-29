# Diagnose: Sync Succeeds But User Not in HRMS

## Problem
- ✅ No errors in browser console
- ✅ Sync API returns success
- ❌ User not appearing in HRMS database

This suggests a **silent failure** - the API call succeeds but the write is being blocked.

## Step 1: Check Server Terminal Logs

When you click "Sync", check the terminal where `npm run dev` is running.

**Look for:**
- `✅ User profile synced to hrms: ...` - This means write succeeded
- `❌ Failed to create/update user_profiles` - This means write failed
- Any error codes like `PGRST116`, `42501`, etc.

## Step 2: Test HRMS Write Permissions

Run this test endpoint to see if writes are being blocked:

**POST** to: `http://localhost:3000/api/test/test-hrms-write`
**Body:**
```json
{
  "email": "your-email@example.com"
}
```

This will test:
- ✅ Can we read from HRMS `user_profiles`?
- ✅ Can we write with anon key?
- ✅ Can we write with service key?

**If anon key write fails but service key succeeds:**
- RLS policies are blocking writes
- Need to use service key for sync (I've updated the code to do this)

## Step 3: Verify User Actually Exists

Visit:
```
http://localhost:3000/api/test/verify-hrms-user?email=your-email@example.com
```

Check:
- `user_in_hrms_profiles: true/false`
- `password_set: true/false`

## Step 4: Check RLS Policies

Run in **HRMS Supabase**:
```sql
-- Check RLS policies on user_profiles
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_profiles';
```

**If RLS is blocking:**
- Run `hrms-ensure-user-profiles.sql` in HRMS
- This sets `ALLOW ALL` policy

## Step 5: Use Service Key for Sync

I've updated the sync code to use **service key** if available (bypasses RLS).

**To configure service key:**
1. Dashboard → Connected Sites → HRMS
2. Click DB icon
3. Add **Supabase Service Key** (not just anon key)
4. Save

**Service key location:**
- HRMS Supabase Dashboard → Settings → API
- Copy "service_role" key (NOT "anon" key)

## Common Silent Failures

### Issue 1: RLS Policies Blocking
**Symptom:** API succeeds, but no data in HRMS
**Fix:** Use service key OR run `hrms-ensure-user-profiles.sql`

### Issue 2: Wrong Table Name
**Symptom:** Error about table not existing
**Fix:** Run `hrms-ensure-user-profiles.sql` in HRMS

### Issue 3: Wrong Supabase URL/Key
**Symptom:** Connection errors
**Fix:** Verify HRMS Supabase credentials in dashboard

## Quick Fix

1. **Add Service Key to HRMS site:**
   - Dashboard → Connected Sites → HRMS → DB icon
   - Add Supabase Service Key
   - Save

2. **Or disable RLS temporarily:**
   - Run in HRMS Supabase:
   ```sql
   ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
   ```

3. **Or run the fix script:**
   - Run `hrms-ensure-user-profiles.sql` in HRMS
   - This sets `ALLOW ALL` policy

4. **Try sync again**

## What I Changed

✅ Updated sync to use **service key** if available (bypasses RLS)
✅ Added test endpoint to check write permissions
✅ Better error logging to catch silent failures

Try syncing again - it should work now with service key!
