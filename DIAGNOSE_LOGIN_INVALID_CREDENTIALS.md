# Diagnose: Invalid Credentials in HRMS Login

## Quick Check

Visit this URL (replace with your email):
```
http://localhost:3000/api/test/check-auth-users?email=your-email@example.com
```

This will show:
- ✅ If user exists in `user_profiles`
- ✅ If user exists in `auth.users` (required for login!)
- ✅ If user exists in `employees`
- ✅ If password is set
- ✅ What the issue is

## Common Issues

### Issue 1: User Not in auth.users

**Symptom:** `auth_users.exists: false`

**Fix:**
1. Make sure service key is set (run `add-service-key-to-hrms.sql`)
2. Re-sync user from dashboard
3. Check server terminal for errors during sync

### Issue 2: Password Not Set

**Symptom:** `user_profiles.has_password: false`

**Fix:**
1. Dashboard → Users → Edit user
2. Add password
3. Save → Sync again

### Issue 3: Password Mismatch

**Symptom:** User exists but login fails

**Fix:**
1. Check password in dashboard matches what you're typing
2. Verify no extra spaces
3. Re-sync user to update password in auth.users

### Issue 4: Service Key Not Working

**Symptom:** Sync succeeds but auth.users not created

**Fix:**
1. Verify service key is correct
2. Check server terminal for auth.admin errors
3. Make sure service key has admin permissions

## Step-by-Step Fix

### Step 1: Check Current Status

Visit: `/api/test/check-auth-users?email=your-email`

**Look for:**
- `auth_users.exists: true` ← Must be true for login!
- `user_profiles.has_password: true` ← Must be true!

### Step 2: If auth_users.exists is false

1. **Check service key:**
   ```sql
   -- Run in Central Supabase
   SELECT name, 
          CASE WHEN supabase_service_key IS NOT NULL THEN '✅' ELSE '❌' END 
   FROM connected_sites WHERE name = 'hrms';
   ```

2. **Re-sync user:**
   - Dashboard → Find user → Click "Sync"
   - Check server terminal for errors
   - Should see: `✅ Auth user created`

### Step 3: Verify Password

Run in **HRMS Supabase**:
```sql
-- Check password in user_profiles
SELECT email, password_hash 
FROM public.user_profiles 
WHERE email = 'your-email@example.com';
```

**Compare:**
- Password in dashboard = `password_hash` in database
- Must match exactly (case-sensitive)

### Step 4: Test Login

After verifying:
1. User exists in `auth.users` ✅
2. Password is set ✅
3. Try login in HRMS

**If still fails:**
- Check email is exact match (case-sensitive)
- Check password is exact match (no spaces)
- Verify auth.users entry was created

## Most Likely Issue

**User not in `auth.users` table**

**Fix:**
1. Make sure service key is set
2. Re-sync user (creates auth.users entry)
3. Check `/api/test/check-auth-users` to verify

The diagnostic endpoint will tell you exactly what's wrong!
