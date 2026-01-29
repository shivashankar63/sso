# Troubleshoot: User Not Syncing to HRMS

## Quick Diagnostic Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Sync" button in dashboard
4. Look for error messages

**Common errors:**
- `Site not found` → HRMS site not added to dashboard
- `Supabase credentials not configured` → Need to add HRMS Supabase URL/key
- `user_profiles table does not exist` → Run `hrms-ensure-user-profiles.sql` in HRMS

### Step 2: Check Server Logs
1. Look at terminal where `npm run dev` is running
2. Click "Sync" button
3. Check for detailed logs:
   - `🔄 Starting sync: userId=...`
   - `✅ User found: ...`
   - `✅ Site found: ...`
   - `✅ User profile synced to hrms: ...`

### Step 3: Verify HRMS Site Configuration

Run in **CENTRAL Supabase**:
```sql
SELECT id, name, is_active, supabase_url, supabase_anon_key
FROM connected_sites
WHERE name = 'hrms';
```

**If `supabase_url` or `supabase_anon_key` is NULL:**
1. Go to Dashboard → Connected Sites
2. Find HRMS site
3. Click database icon (🔗)
4. Add Supabase URL and Anon Key
5. Save → Test Connection

### Step 4: Check if User Exists in HRMS

Run in **HRMS Supabase**:
```sql
SELECT * FROM public.user_profiles 
WHERE email = 'your-email@example.com';
```

**If empty:**
- Sync didn't work
- Check error messages in console/logs
- Verify HRMS Supabase credentials

### Step 5: Check RLS Policies

Run in **HRMS Supabase**:
```sql
-- Check if RLS is blocking
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';
```

**If policies are too restrictive:**
- Run `hrms-ensure-user-profiles.sql` again
- This sets `ALLOW ALL` policy

## Common Issues & Fixes

### Issue 1: "Site not found"
**Fix:**
1. Dashboard → Connected Sites → Add HRMS site
2. Configure Supabase credentials
3. Set `is_active = true`

### Issue 2: "Supabase credentials not configured"
**Fix:**
1. Dashboard → Connected Sites → HRMS
2. Click DB icon → Add credentials
3. Save → Sync again

### Issue 3: "user_profiles table does not exist"
**Fix:**
1. Go to HRMS Supabase SQL Editor
2. Run `hrms-ensure-user-profiles.sql`
3. Verify table exists:
   ```sql
   SELECT * FROM public.user_profiles LIMIT 1;
   ```

### Issue 4: "RLS policy blocking"
**Fix:**
1. Run `hrms-ensure-user-profiles.sql` in HRMS
2. This creates `ALLOW ALL` policy

### Issue 5: Sync succeeds but user not visible
**Possible causes:**
- RLS policies blocking SELECT
- Wrong table name
- Email mismatch

**Fix:**
1. Check RLS policies (see Step 5 above)
2. Verify table name is `user_profiles` (not `users`)
3. Check email is exact match (case-sensitive)

## Test Sync Manually

Use the test endpoint:
```
GET /api/test/check-sync-status?email=your-email&siteId=hrms-site-id
```

This will show:
- If user exists in HRMS
- If password is set
- Any errors

## Still Not Working?

1. **Check all logs** (browser console + server terminal)
2. **Verify HRMS Supabase credentials** are correct
3. **Run `hrms-ensure-user-profiles.sql`** in HRMS
4. **Check RLS policies** are not blocking
5. **Try manual sync** using test endpoint

The detailed logging I added will show exactly where the sync is failing!
