# Complete Fix: HRMS Login Not Working

## Root Cause

HRMS login uses `supabase.auth.signInWithPassword()` which checks `auth.users` table, but we're only syncing to `user_profiles` table. They're different!

- ❌ **HRMS checks**: `auth.users` table (Supabase Auth)
- ✅ **We sync to**: `user_profiles` table (custom table)

## Solution: Create Users in Both Tables

I've updated the sync API to create users in BOTH:
1. ✅ `user_profiles` table (already doing this)
2. ✅ `auth.users` table (NEW - for Supabase Auth login)

## What Changed

The sync API now:
1. Creates/updates `user_profiles` table ✅
2. Creates/updates `auth.users` table ✅ (NEW!)
3. Sets password in `auth.users` for login ✅

## Requirements

**Service Key Required**: Creating `auth.users` requires service role key (admin access).

Make sure service key is set:
- Run `add-service-key-to-hrms.sql` in Central Supabase
- Or add via dashboard → Connected Sites → HRMS → DB icon

## After Syncing

1. **User exists in `user_profiles`** ✅
2. **User exists in `auth.users`** ✅ (NEW!)
3. **HRMS login should work** ✅

## Test Login

After syncing, try logging in to HRMS:
- Email: From dashboard
- Password: From dashboard
- Should work with `supabase.auth.signInWithPassword()` now!

## If Still Not Working

### Option 1: Re-sync Users

Since we just added auth.users creation, re-sync existing users:
1. Go to dashboard
2. Click "Sync" on each user
3. This will create auth.users entries

### Option 2: Verify auth.users

Run in **HRMS Supabase**:
```sql
-- Check if user exists in auth.users
SELECT id, email, created_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

**If empty:**
- Service key not set → Add service key
- Re-sync user → Should create auth.users entry

### Option 3: Manual Create (If Needed)

If sync still doesn't create auth.users, you can create manually:

```sql
-- This requires service role key
-- Use Supabase Admin API or dashboard
```

## Summary

✅ **Sync now creates users in both tables**
✅ **HRMS Supabase Auth login should work**
✅ **No changes needed to HRMS login code**

Just re-sync your users and login should work! 🎉
