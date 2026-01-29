# Quick Fix: Invalid Credentials in HRMS

## Step 1: Check What's Wrong

Visit this URL (replace with your email):
```
http://localhost:3000/api/test/check-auth-users?email=your-email@example.com
```

**Look for:**
- `auth_users.exists: true` ← **MUST be true for login!**
- `user_profiles.has_password: true` ← **MUST be true!**

## Step 2: If auth_users.exists is FALSE

**The user is not in `auth.users` table!**

**Fix:**
1. **Check service key is set:**
   - Run `add-service-key-to-hrms.sql` in Central Supabase
   - Or check dashboard → Connected Sites → HRMS → DB icon

2. **Re-sync the user:**
   - Dashboard → Find user → Click "Sync"
   - **Check server terminal** - should see:
     ```
     🔐 Creating auth.users entry...
     ✅ Auth user created - can now login with Supabase Auth!
     ```

3. **If you see errors:**
   - `❌ Failed to create auth.users entry` → Service key issue
   - Check service key is correct
   - Re-sync again

## Step 3: If Password Mismatch

**Check password:**
1. Dashboard → Users → Edit user
2. Verify password is set
3. Re-sync to update password in auth.users

**Test:**
- Type password exactly as set in dashboard
- No extra spaces
- Case-sensitive

## Step 4: Verify in HRMS Supabase

**Check auth.users:**
1. Go to HRMS Supabase Dashboard
2. Authentication → Users
3. Should see your user's email

**If not there:**
- Service key not working
- Re-sync user
- Check server terminal for errors

## Most Common Issue

**User not in `auth.users` table**

**Quick Fix:**
1. Verify service key: Run `add-service-key-to-hrms.sql`
2. Re-sync user: Dashboard → Sync button
3. Check terminal: Should see "✅ Auth user created"
4. Try login again

The diagnostic endpoint will tell you exactly what's wrong!
