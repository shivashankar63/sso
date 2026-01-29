# Quick Fix: User Not in HRMS Database

## Problem
- User created in dashboard ✅
- User synced ✅  
- But user not in HRMS database ❌
- Login shows "invalid credentials" ❌

## Quick Fix (3 Steps)

### Step 1: Check if User Exists in HRMS

Run this in **HRMS Supabase SQL Editor**:
```sql
SELECT * FROM public.user_profiles 
WHERE email = 'your-email@example.com';
```

**Replace `your-email@example.com` with the actual email you used.**

### Step 2: If User Doesn't Exist

**Option A: Sync Again (Recommended)**
1. Go to SSO Dashboard
2. Find the user
3. Click "Sync" button next to HRMS
4. Check browser console for errors

**Option B: Check HRMS Site Configuration**
1. Go to Dashboard → Connected Sites
2. Find HRMS site
3. Click the database icon (🔗)
4. Verify:
   - Supabase URL is correct
   - Supabase Anon Key is correct
5. Click "Test Connection" - should show ✅

### Step 3: Verify Password is Set

Run in **HRMS Supabase**:
```sql
SELECT email, 
       CASE 
         WHEN password_hash IS NULL THEN '❌ No password - Update user in dashboard'
         WHEN password_hash = '' THEN '❌ Empty password - Update user in dashboard'
         ELSE '✅ Password set - Ready to login'
       END as status
FROM public.user_profiles 
WHERE email = 'your-email@example.com';
```

**If password is NULL:**
1. Go to Dashboard → Users
2. Find user → Edit
3. Add password
4. Click "Sync" again

## Common Issues

### Issue 1: "Table user_profiles does not exist"
**Fix:** Run `hrms-ensure-user-profiles.sql` in HRMS Supabase

### Issue 2: "Site Supabase credentials not configured"
**Fix:** 
1. Dashboard → Connected Sites → HRMS
2. Click DB icon → Add Supabase URL and Key
3. Save → Test Connection

### Issue 3: "User synced but password_hash is NULL"
**Fix:**
1. Dashboard → Users → Edit user
2. Add password field
3. Save → Sync again

## Test Login

After fixing, try login in HRMS:
- Email: `your-email@example.com`
- Password: The password you set in dashboard

**Note:** HRMS login code needs to check `user_profiles` table:
```javascript
const { data: user } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('email', email)
  .single();

if (user && user.password_hash === password) {
  // Login successful!
}
```

## Still Not Working?

1. **Check sync logs:** Browser console when clicking "Sync"
2. **Check API:** Visit `/api/test/check-sync-status?email=your-email&siteId=hrms-site-id`
3. **Verify tables:** Run `check-user-in-hrms.sql` in HRMS Supabase
