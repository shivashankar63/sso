# Quick Verify: Is User Actually in HRMS?

## Step 1: Check Server Terminal

When you click "Sync", check the terminal where `npm run dev` is running. You should see logs like:

```
🔄 Starting sync: userId=...
✅ User found: user@example.com
✅ Site found: hrms
✅ Site credentials configured: https://...
💾 Syncing user_profiles to hrms...
✅ User profile synced to hrms: user@example.com
   ✅ Password synced - user can login
```

**If you see errors**, that's the problem!

## Step 2: Verify User Actually Exists in HRMS

### Option A: Use Test Endpoint (Easiest)

Open in browser:
```
http://localhost:3000/api/test/verify-hrms-user?email=your-email@example.com
```

Replace `your-email@example.com` with the actual email you used.

**This will show:**
- ✅ If user exists in central database
- ✅ If user exists in HRMS `user_profiles` table
- ✅ If user exists in HRMS `employees` table
- ✅ If password is set
- ✅ Recent sync logs

### Option B: Check HRMS Supabase Directly

1. Go to HRMS Supabase Dashboard
2. Open SQL Editor
3. Run:
```sql
SELECT * FROM public.user_profiles 
WHERE email = 'your-email@example.com';
```

**If empty:** User wasn't synced (check errors in terminal)

**If exists but `password_hash` is NULL:** Password wasn't set

## Step 3: Check Sync Results

After clicking "Sync", the alert should now show:
- ✅ Success: X
- ❌ Failed: Y (if any)
- List of failed sites with error messages

## Common Issues

### Issue: Sync says "success" but user not in HRMS

**Possible causes:**
1. **RLS policies blocking** - Run `hrms-ensure-user-profiles.sql` in HRMS
2. **Wrong Supabase URL/Key** - Check HRMS site configuration
3. **Table doesn't exist** - Run `hrms-ensure-user-profiles.sql` in HRMS

**Fix:**
1. Run `hrms-ensure-user-profiles.sql` in HRMS Supabase
2. Verify HRMS Supabase credentials in dashboard
3. Try sync again

### Issue: User exists but password_hash is NULL

**Fix:**
1. Dashboard → Users → Edit user
2. Add password
3. Save → Sync again

## Quick Test

1. Click "Sync" in dashboard
2. Check terminal for detailed logs
3. Visit: `/api/test/verify-hrms-user?email=your-email`
4. Check if user exists in HRMS

The test endpoint will tell you exactly what's wrong!
