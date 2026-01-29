# Migration Guide: From Supabase Auth to Clerk SSO

If you already have the original schema that uses `auth.users`, you need to migrate to the Clerk-compatible version.

## Key Differences

### Original Schema (Supabase Auth)
- Uses `auth.users` table
- User IDs are UUIDs
- References `auth.uid()` in RLS policies
- Triggers on `auth.users` table

### New Schema (Clerk SSO)
- Uses Clerk user IDs (TEXT)
- User IDs come from Clerk JWT token
- Uses `get_user_id()` function in RLS policies
- No triggers on `auth.users` (doesn't exist)

## Migration Steps

### Option 1: Fresh Start (Recommended for New Projects)

1. **Drop existing tables** (if you have them):
```sql
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.app_access CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
```

2. **Run the Clerk-compatible schema**:
   - Run `supabase-migration.sql` first (creates `get_user_id()` function)
   - Then run `supabase-clerk-schema.sql`

### Option 2: Migrate Existing Data

If you have existing data, you'll need to:

1. **Create new Clerk-compatible tables**:
```sql
-- Run supabase-clerk-schema.sql to create new tables
```

2. **Migrate data** (adjust based on your data):
```sql
-- Example: Migrate user profiles
-- You'll need to map Supabase user IDs to Clerk user IDs
INSERT INTO public.user_profiles (id, email, full_name, clerk_user_id, role)
SELECT 
    'clerk_' || id::text,  -- Generate Clerk ID (you'll need actual mapping)
    email,
    raw_user_meta_data->>'full_name',
    'clerk_' || id::text,
    'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

3. **Update foreign keys** in related tables

## What You Need to Do

### 1. Check Your Current Schema

Run this to see what tables you have:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_roles', 'app_access', 'audit_logs');
```

### 2. If Tables Don't Exist

Run `supabase-clerk-schema.sql` - it will create everything fresh.

### 3. If Tables Already Exist

You have two options:

**A. Drop and recreate** (if you don't have important data):
```sql
-- Drop existing tables
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.app_access CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Then run supabase-clerk-schema.sql
```

**B. Keep and adapt** (if you have data):
- You'll need to manually update the schema
- Change UUID columns to TEXT for user IDs
- Update RLS policies to use `get_user_id()`
- Map existing user IDs to Clerk user IDs

## Quick Check

Run this to see if your schema is Clerk-compatible:

```sql
-- Check if user_profiles uses TEXT for id (Clerk) or UUID (Supabase Auth)
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles' 
AND column_name = 'id';
```

- If `data_type` is `text` → ✅ Clerk-compatible
- If `data_type` is `uuid` → ❌ Needs migration

## After Migration

1. Update your application code to use Clerk user IDs
2. Use the helper functions in `lib/supabase-helpers.ts`
3. Call `/api/users/sync-profile` after user signs in to create their profile

## Need Help?

If you're unsure which approach to take, share:
1. Whether you have existing data
2. The output of the "Check Your Current Schema" query above
3. Whether you're using Supabase Auth currently
