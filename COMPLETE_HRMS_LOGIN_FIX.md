# Complete Fix: HRMS Login Not Working

## The Problem

HRMS login uses `supabase.auth.signInWithPassword()` which checks `auth.users` table, but:
- ❌ We only sync to `user_profiles` table (TEXT id)
- ❌ `auth.users` table is empty (needs UUID id)
- ❌ `employees` table references `auth.users(id)` (needs UUID)

## The Solution

I've updated the sync to create users in **ALL THREE** tables:

1. ✅ **`user_profiles`** - For data storage (TEXT id)
2. ✅ **`auth.users`** - For Supabase Auth login (UUID id) ← **NEW!**
3. ✅ **`employees`** - For HRMS employee records (UUID id, references auth.users) ← **NEW!**

## How It Works Now

### When You Sync a User:

1. **Creates `user_profiles` entry** (TEXT id from central dashboard)
2. **Generates UUID** for HRMS auth
3. **Creates `auth.users` entry** with UUID and password
4. **Creates `employees` entry** with same UUID (links to auth.users)

### ID Mapping:

- **Central Dashboard**: `user_1234567890_abc` (TEXT)
- **HRMS auth.users**: `550e8400-e29b-41d4-a716-446655440000` (UUID)
- **HRMS employees**: `550e8400-e29b-41d4-a716-446655440000` (UUID, same as auth.users)
- **HRMS user_profiles**: `user_1234567890_abc` (TEXT, from central)

## Requirements

**Service Key Required**: Creating `auth.users` requires service role key.

Make sure service key is set:
- Run `add-service-key-to-hrms.sql` in Central Supabase
- Or add via dashboard → Connected Sites → HRMS → DB icon

## What to Do Now

### Step 1: Verify Service Key

Run in **Central Supabase**:
```sql
SELECT 
  name,
  CASE WHEN supabase_service_key IS NOT NULL THEN '✅' ELSE '❌' END as service_key
FROM connected_sites
WHERE name = 'hrms';
```

**If ❌:** Run `add-service-key-to-hrms.sql`

### Step 2: Re-Sync All Users

Since we just added `auth.users` creation, re-sync existing users:
1. Go to dashboard
2. Click "Sync" on each user
3. This will create `auth.users` and `employees` entries

### Step 3: Verify auth.users Created

Run in **HRMS Supabase**:
```sql
-- Check if users exist in auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;

-- Check employees
SELECT id, email, full_name, employee_status
FROM employees
ORDER BY created_at DESC;
```

**If empty:**
- Service key not set → Add service key
- Re-sync users → Should create entries

### Step 4: Test Login

After re-syncing, try logging in to HRMS:
- Email: From dashboard
- Password: From dashboard
- Should work with `supabase.auth.signInWithPassword()` now!

## What Changed

✅ **Sync creates `auth.users` entries** (UUID)
✅ **Sync creates `employees` entries** (UUID, linked to auth.users)
✅ **Sync still creates `user_profiles`** (TEXT, for data)
✅ **All three tables are synced** - HRMS login should work!

## Summary

- **Before**: Only `user_profiles` synced → Login failed
- **After**: `user_profiles` + `auth.users` + `employees` synced → Login works! ✅

Re-sync your users and login should work! 🎉
