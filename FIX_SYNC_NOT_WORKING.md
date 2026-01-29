# Fix: Users Not Syncing to HRMS Database

## Problem

After clicking "Sync", users are not appearing in HRMS Supabase database.

## Common Causes

### 1. HRMS Supabase Credentials Not Configured ❌

**Check:**
- Go to dashboard
- Find HRMS site card
- Click Database icon (🗄️)
- Check if Supabase URL and Anon Key are filled in

**Fix:**
- Enter HRMS Supabase URL: `https://snjtkvvmjqizdfyqbyzd.supabase.co`
- Enter HRMS Supabase Anon Key
- Click "Save Credentials"
- Try syncing again

### 2. Site Status Not "active"

**Check:**
Run in Central Supabase:
```sql
SELECT name, status, is_active 
FROM connected_sites 
WHERE name = 'hrms';
```

**Fix:**
If status is not "active":
```sql
UPDATE connected_sites 
SET status = 'active', is_active = true 
WHERE name = 'hrms';
```

### 3. Sync API Failing Silently

**Check:**
- Open browser console (F12)
- Click "Sync" on a user
- Look for error messages in console

**Fix:**
- Check network tab for failed API calls
- Look for error messages
- Check server logs

### 4. RLS Policies Blocking Insert

**Check:**
HRMS Supabase might have RLS blocking inserts.

**Fix:**
Run in HRMS Supabase:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- If needed, allow inserts
CREATE POLICY "Allow service role inserts" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (true);
```

## Step-by-Step Debugging

### Step 1: Verify HRMS Site Configuration

1. Go to dashboard
2. Find HRMS site
3. Click Database icon (🗄️)
4. Verify:
   - ✅ Supabase URL is set
   - ✅ Anon Key is set
   - ✅ Test Connection works

### Step 2: Check Site Status

Run `test-sync-direct.sql` in Central Supabase to check:
- Site exists
- Site is active
- Credentials configured

### Step 3: Test Sync Manually

1. Open browser console (F12)
2. Click "Sync" on a user
3. Check console for errors
4. Check Network tab for API calls
5. Look for `/api/sync/user-to-site` call
6. Check response for errors

### Step 4: Verify User in HRMS

After syncing, check HRMS Supabase:
```sql
SELECT * FROM public.user_profiles;
```

If empty, sync didn't work.

## Quick Fix

1. **Verify HRMS credentials** in dashboard
2. **Check site status** is "active"
3. **Try syncing again**
4. **Check browser console** for errors
5. **Verify in HRMS Supabase** if user appears

## Manual Sync Test

You can also test the sync API directly:

```javascript
// In browser console
fetch('/api/sync/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'your-user-id' })
})
.then(r => r.json())
.then(console.log);
```

This will show you exactly what's happening during sync!
