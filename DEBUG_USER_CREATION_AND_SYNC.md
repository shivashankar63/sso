# Debug: User Creation and Sync Issues

## Problem

After creating a user in the dashboard and syncing, the diagnostic still shows:
- ❌ User doesn't exist in central dashboard
- ❌ User doesn't exist in HRMS

## Step 1: List ALL Users

Visit this endpoint to see ALL users:
```
http://localhost:3000/api/test/list-all-users
```

**This will show:**
- ✅ All users in central database
- ✅ All users in HRMS database
- ✅ All auth.users in HRMS
- ✅ Comparison: which users are missing in HRMS

**Look for:**
- Is your user in the central database list?
- Is your user in the HRMS list?
- What email format is being used?

## Step 2: Check Server Terminal

When you create a user, check the server terminal for:
- ✅ "User added successfully" message
- ❌ Any error messages

When you sync, check the server terminal for:
- ✅ "🔐 Creating auth.users entry..."
- ✅ "✅ Auth user created"
- ❌ Any error messages

## Step 3: Common Issues

### Issue 1: User Creation Failed Silently

**Symptoms:**
- User doesn't appear in `/api/test/list-all-users`
- No error shown in UI

**Fix:**
1. Check browser console (F12) for errors
2. Check server terminal for errors
3. Verify `user_profiles` table exists in Central Supabase
4. Check RLS policies allow inserts

**Test:**
```sql
-- Run in Central Supabase SQL Editor
SELECT * FROM public.user_profiles ORDER BY created_at DESC LIMIT 5;
```

### Issue 2: Email Case/Whitespace Mismatch

**Symptoms:**
- User exists but diagnostic can't find it
- Different email format in database vs search

**Fix:**
1. Check exact email in `/api/test/list-all-users`
2. Use exact email (case-sensitive) in diagnostic
3. Check for extra spaces

**Example:**
- Database: `Peru@Example.com`
- Search: `peru@example.com` ← Might not match!

### Issue 3: Sync Failed Silently

**Symptoms:**
- User in central database
- User NOT in HRMS
- No error shown

**Fix:**
1. Check server terminal for sync errors
2. Verify service key is set
3. Check HRMS Supabase credentials
4. Verify HRMS tables exist

**Test:**
```sql
-- Run in HRMS Supabase SQL Editor
SELECT * FROM public.user_profiles ORDER BY created_at DESC LIMIT 5;
```

### Issue 4: RLS Blocking Operations

**Symptoms:**
- Operations succeed but data doesn't appear
- Errors about permissions

**Fix:**
1. Run `fix-hrms-rls-simple.sql` in HRMS Supabase
2. Run `fix-user-profiles-rls-complete.sql` in Central Supabase
3. Verify service key has admin permissions

## Step 4: Manual Verification

### Check Central Database

```sql
-- Run in Central Supabase SQL Editor
SELECT 
  id,
  email,
  full_name,
  CASE WHEN password_hash IS NOT NULL THEN '✅' ELSE '❌' END as has_password,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC;
```

### Check HRMS Database

```sql
-- Run in HRMS Supabase SQL Editor
-- Check user_profiles
SELECT 
  id,
  email,
  full_name,
  CASE WHEN password_hash IS NOT NULL THEN '✅' ELSE '❌' END as has_password,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- Check auth.users (via Dashboard > Authentication > Users)
-- Or use API: /api/test/list-all-users
```

## Step 5: Re-create User (If Needed)

If user creation failed:

1. **Clear any partial data:**
   ```sql
   -- Run in Central Supabase (if needed)
   DELETE FROM public.user_profiles WHERE email = 'your-email@example.com';
   ```

2. **Create user again:**
   - Dashboard → Add User
   - Fill form carefully
   - Check terminal for errors

3. **Sync again:**
   - Dashboard → Sync button
   - Check terminal for "Auth user created"

## Step 6: Verify Complete Flow

### Checklist:

- [ ] User appears in `/api/test/list-all-users` (central)
- [ ] User has password set
- [ ] Service key is configured for HRMS
- [ ] Sync button clicked
- [ ] Terminal shows "Auth user created"
- [ ] User appears in `/api/test/list-all-users` (HRMS)
- [ ] User in HRMS auth.users
- [ ] Login works in HRMS

## Quick Test

1. **List all users:**
   ```
   GET /api/test/list-all-users
   ```

2. **Check specific user:**
   ```
   GET /api/test/check-central-user?email=EXACT_EMAIL_FROM_LIST
   ```

3. **Check HRMS sync:**
   ```
   GET /api/test/check-auth-users?email=EXACT_EMAIL_FROM_LIST
   ```

Use the `/api/test/list-all-users` endpoint first to see what's actually in the databases!
