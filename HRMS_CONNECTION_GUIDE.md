
# HRMS Site Connection Guide

This guide helps you connect your HRMS site's Supabase database to the SSO Dashboard.

## HRMS Supabase Details

- **Project ID**: `snjtkvvmjqizdfyqbyzd`
- **Project URL**: `https://snjtkvvmjqizdfyqbyzd.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (for admin operations)

## Step 1: Set Up HRMS Supabase Database

1. Go to [HRMS Supabase Dashboard](https://supabase.com/dashboard/project/snjtkvvmjqizdfyqbyzd)
2. Open **SQL Editor**
3. Run `site-supabase-schema.sql`
4. This creates the `user_profiles` table to receive synced users

## Step 2: Add HRMS Site to Dashboard

### Option A: Using SQL (Quick)

1. Go to [Central Dashboard Supabase](https://supabase.com/dashboard/project/snvyotfofpdkheecupho)
2. Open **SQL Editor**
3. Run `add-hrms-site.sql`
4. This adds HRMS site with all Supabase credentials configured

### Option B: Using Dashboard UI

1. Open dashboard: http://localhost:3000
2. Scroll to "Connected Applications"
3. Click "Add Site"
4. Fill in:
   - **Site Name**: `hrms`
   - **Display Name**: `HRMS System`
   - **URL**: Your HRMS site URL
   - **Icon**: `💼`
   - **Category**: `hrms`
5. Click "Add Site"
6. Click the **Database icon (🗄️)** next to HRMS
7. Enter:
   - **Supabase URL**: `https://snjtkvvmjqizdfyqbyzd.supabase.co`
   - **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuanRrdnZtanFpemRmeXFieXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzE3ODksImV4cCI6MjA2ODA0Nzc4OX0.cphGba1NoF7CqmeJqI-B9uJsLy1r18HHKFsmslT59GY`
8. Click "Test Connection"
9. Click "Save Credentials"

## Step 3: Test Connection

### Via API

Visit: http://localhost:3000/api/test/hrms-connection

This will test if:
- HRMS Supabase is accessible
- Credentials are correct
- `user_profiles` table exists

### Via Dashboard

1. Open dashboard
2. Find HRMS site card
3. Click Database icon
4. Click "Test Connection"

## Step 4: Sync Users

Once connected:

1. **Add a user** in the dashboard
2. User automatically syncs to HRMS Supabase
3. **Check sync status** in "User Data Sync" section
4. **Verify in HRMS Supabase**:
   ```sql
   SELECT * FROM public.user_profiles;
   ```

## Verification Checklist

- [ ] HRMS Supabase has `user_profiles` table
- [ ] HRMS site added to dashboard
- [ ] Supabase credentials configured
- [ ] Connection test successful
- [ ] User sync working

## Troubleshooting

### "Connection failed"
- Verify Supabase URL is correct
- Check Anon Key is valid
- Ensure HRMS Supabase is accessible
- Check if `user_profiles` table exists

### "Table doesn't exist"
- Run `site-supabase-schema.sql` in HRMS Supabase
- Verify table was created

### "User not syncing"
- Check sync status in dashboard
- Verify Supabase credentials are saved
- Check sync logs for errors

## Next Steps

After HRMS is connected:
1. Add your other sites (CMS, Sales, Garage)
2. Configure their Supabase credentials
3. Start syncing users across all sites

Your HRMS site is now ready to receive synced users from the SSO Dashboard!
