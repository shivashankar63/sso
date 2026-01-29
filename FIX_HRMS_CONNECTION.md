# Fix: HRMS Connection Failed - user_profiles table missing

## Error Message
```
Connection failed: relation "public.user_profiles" does not exist
```

## What This Means
The connection to HRMS Supabase **works**, but the `user_profiles` table doesn't exist in the HRMS database yet.

## Solution

### Step 1: Go to HRMS Supabase Database

1. Go to [HRMS Supabase Dashboard](https://supabase.com/dashboard/project/snjtkvvmjqizdfyqbyzd)
   - This is the HRMS site's Supabase (NOT the central dashboard Supabase)
   - Project ID: `snjtkvvmjqizdfyqbyzd`

### Step 2: Run the Schema

1. Open **SQL Editor** in HRMS Supabase
2. Run `site-supabase-schema.sql`
   - This creates the `user_profiles` table
   - This table will receive synced users from the dashboard

### Step 3: Test Connection Again

1. Go back to your dashboard
2. Click the Database icon (🗄️) on HRMS site
3. Click "Test Connection"
4. Should now show: ✅ Connection successful!

## Important Notes

- **Central Dashboard Supabase**: `snvyotfofpdkheecupho` (manages sites)
- **HRMS Supabase**: `snjtkvvmjqizdfyqbyzd` (receives synced users)

You need to run `site-supabase-schema.sql` in the **HRMS Supabase**, not the central one.

## After Running Schema

The HRMS Supabase will have:
- ✅ `user_profiles` table created
- ✅ Ready to receive synced users
- ✅ Connection test will pass

## Quick Checklist

- [ ] Go to HRMS Supabase (snjtkvvmjqizdfyqbyzd)
- [ ] Open SQL Editor
- [ ] Run `site-supabase-schema.sql`
- [ ] Test connection in dashboard
- [ ] Should see ✅ Connection successful!

The connection test is now fixed to show a helpful message if the table is missing!
