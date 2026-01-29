# Fix: Sync Success But No Data in HRMS

## Problem
- ✅ Sync shows "success"
- ❌ User not appearing in HRMS database

## Root Causes

### 1. RLS Policies Blocking Writes
**Symptom:** Write appears to succeed but data not in database
**Fix:** Use service key (bypasses RLS)

### 2. Wrong Supabase Credentials
**Symptom:** Writing to wrong database
**Fix:** Verify HRMS Supabase URL/key in dashboard

### 3. Transaction Rollback
**Symptom:** Write succeeds but gets rolled back
**Fix:** Check for errors after write

## Quick Fix

### Step 1: Add Service Key

1. **Get Service Key from HRMS Supabase:**
   - Go to HRMS Supabase Dashboard
   - Settings → API
   - Copy **"service_role"** key (NOT "anon" key)

2. **Add to Dashboard:**
   - Dashboard → Connected Sites → HRMS
   - Click DB icon
   - Paste service key in "Supabase Service Key" field
   - Save

### Step 2: Test Force Sync

**POST** to: `http://localhost:3000/api/test/force-sync-to-hrms`
**Body:**
```json
{
  "email": "your-email@example.com"
}
```

This will:
- ✅ Show detailed steps
- ✅ Verify write actually happened
- ✅ Tell you if RLS is blocking

### Step 3: Verify in HRMS

Run in **HRMS Supabase SQL Editor**:
```sql
SELECT * FROM public.user_profiles 
WHERE email = 'your-email@example.com';
```

**If still empty:**
- Check if using service key
- Check RLS policies
- Verify Supabase URL is correct

## What I Added

✅ **Verification step** - After sync, reads back to confirm write
✅ **Force sync endpoint** - Tests write with detailed logging
✅ **Better error messages** - Shows exactly what's wrong

## Check Server Logs

When you sync, check terminal for:
```
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
- **Use service key** to bypass RLS

## Most Likely Fix

**Add service key to HRMS site configuration!**

The service key bypasses RLS policies, so writes will actually succeed.
