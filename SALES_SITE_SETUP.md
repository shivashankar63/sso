# Sales Site Setup Guide

## Sales App Details

- **Site URL**: https://firstpsales.vercel.app/
- **Supabase URL**: https://uvqlonqtlqypxqatgbih.supabase.co
- **Status**: Ready to connect

## Step 1: Add Sales Site to Central Dashboard

### Option A: Via SQL (Quick)

1. Go to **Central Supabase Dashboard** (your main SSO dashboard Supabase)
2. Open **SQL Editor**
3. Run `add-sales-site-complete.sql`
4. ✅ Sales site will be added with all credentials configured

### Option B: Via Dashboard UI

1. Go to dashboard: `http://localhost:3000`
2. Scroll to **"Connected Sites"** section
3. Click **"Add Site"** button
4. Fill in:
   - **Site Name**: `sales`
   - **Display Name**: `Sales Portal`
   - **URL**: `https://firstpsales.vercel.app/`
   - **Icon**: `💰`
   - **Category**: `sales`
5. Click **"Add Site"**
6. Click **Database icon (🗄️)** next to Sales site
7. Enter:
   - **Supabase URL**: `https://uvqlonqtlqypxqatgbih.supabase.co`
   - **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cWxvbnF0bHF5cHhxYXRnYmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTUwNjYsImV4cCI6MjA4MzI3MTA2Nn0.nr4eX7XcKlUaJ5Sg3OJDCj0MLpBae6hxfYjRcddYLQM`
   - **Supabase Service Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cWxvbnF0bHF5cHhxYXRnYmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY5NTA2NiwiZXhwIjoyMDgzMjcxMDY2fQ.dbW-b0MdbZKrSEp6YdWNdBnz-xMHw132WO3qJKOXpWo`
8. Click **"Test Connection"**
9. Click **"Save Credentials"**

## Step 2: Set Up Sales Supabase Database

Before syncing users, set up the Sales database to receive synced users:

1. Go to **Sales Supabase Dashboard**: https://supabase.com/dashboard/project/uvqlonqtlqypxqatgbih
2. Open **SQL Editor**
3. Run `sales-supabase-schema.sql` to create the `users` table

**Important:** Sales app uses a different schema than HRMS:
- **Sales**: `auth.users` (UUID) + `users` table (UUID)
- **HRMS**: `auth.users` (UUID) + `employees` (UUID) + `user_profiles` (TEXT)

**SQL to run in Sales Supabase:**

Use the file: `sales-supabase-schema.sql`

Or copy the SQL from that file and run it in Sales Supabase SQL Editor.

4. (Optional) If you need to disable RLS for testing, run `fix-hrms-rls-simple.sql` (same logic applies)

## Step 3: Verify Connection

1. In dashboard, click **Database icon** next to Sales site
2. Click **"Test Connection"**
3. Should see: ✅ "Connection successful!"

## Step 4: Sync Users to Sales Site

1. Go to dashboard: `http://localhost:3000`
2. Scroll to **"User Management"** section
3. Find a user
4. Click **"Sync"** button
5. Select **Sales** site
6. Click **"Sync to Sales"**

Watch the server terminal - you should see:
```
🔄 Starting sync: userId=..., siteId=...
✅ User found: user@example.com
🔐 Creating auth.users entry...
✅ Auth user created - can now login with Supabase Auth!
✅ User profile synced to Sales
```

## Step 5: Verify User Synced

Check if user exists in Sales:
```
GET /api/test/check-auth-users?email=user-email@example.com
```

Or check directly in Sales Supabase:
```sql
-- Run in Sales Supabase SQL Editor
-- Check users table
SELECT * FROM public.users ORDER BY created_at DESC;

-- Check auth.users (if you have admin access)
SELECT id, email, email_confirmed_at FROM auth.users ORDER BY created_at DESC;
```

## Step 6: Test Login in Sales App

1. Go to: https://firstpsales.vercel.app/
2. Try logging in with:
   - **Email**: User email from dashboard
   - **Password**: Password set in dashboard

## Troubleshooting

### If connection test fails:
- Verify Supabase URL is correct
- Check anon key is correct
- Ensure Sales Supabase project is active

### If sync fails:
- Check service key is set correctly
- Verify `users` table exists in Sales Supabase (NOT `user_profiles`)
- Check RLS policies allow inserts
- Check server terminal for detailed error messages

### If login doesn't work:
- Verify user was synced to Sales (check `/api/test/check-auth-users`)
- Check if `auth.users` entry was created (requires service key)
- Verify password matches what was set in dashboard

## Quick Checklist

- [ ] Sales site added to central dashboard
- [ ] Supabase credentials configured (URL, anon key, service key)
- [ ] Connection test successful
- [ ] `users` table created in Sales Supabase (run `sales-supabase-schema.sql`)
- [ ] RLS policies configured
- [ ] User synced to Sales site
- [ ] User appears in Sales database (`users` table and `auth.users`)
- [ ] Login works in Sales app

## Next Steps

After Sales is connected:
- Add CMS site (if needed)
- Add Garage site (if needed)
- Configure user access policies
- Set up automated sync schedules

---

**Sales site is now ready to receive synced users!** 🎉
