# CMS Site Setup Guide

## CMS App Details

This guide helps you connect your CMS (Content Management System) to the SSO Dashboard.

## Step 1: Add CMS Site to Central Dashboard

### Option A: Via SQL (Quick)

1. Go to **Central Supabase Dashboard** (your main SSO dashboard Supabase)
2. Open **SQL Editor**
3. Run `configure-cms-complete.sql` with your actual CMS credentials
4. ✅ CMS site will be added with all credentials configured

### Option B: Via Dashboard UI

1. Go to dashboard: `http://localhost:3000`
2. Scroll to **"Connected Sites"** section
3. Click **"Add Site"** button
4. Fill in:
   - **Site Name**: `cms`
   - **Display Name**: `CMS System`
   - **URL**: `https://your-cms-site.vercel.app/` (your actual CMS URL)
   - **Icon**: `📝`
   - **Category**: `cms`
5. Click **"Add Site"**
6. Click **Database icon (🗄️)** next to CMS site
7. Enter your CMS Supabase credentials:
   - **Supabase URL**: `https://your-cms-project.supabase.co`
   - **Supabase Anon Key**: `your-cms-anon-key`
   - **Supabase Service Key**: `your-cms-service-key`
8. Click **"Test Connection"**
9. Click **"Save Credentials"**

## Step 2: Set Up CMS Supabase Database

Before syncing users, set up the CMS database to receive synced users:

1. Go to **CMS Supabase Dashboard**: https://supabase.com/dashboard/project/your-cms-project
2. Open **SQL Editor**
3. Run `site-supabase-schema.sql` to create the `user_profiles` table

**CMS Database Schema:**
- **CMS**: `auth.users` (UUID) + `user_profiles` (TEXT) or `users` (UUID)
- Uses standard user_profiles table structure

## Step 3: CMS-Specific Configuration

### CMS User Roles

CMS supports the following roles:
- **admin** - Full access to CMS
- **editor** - Can edit and publish content
- **author** - Can create and edit own content
- **user** - Basic access

### CMS Table Structure

CMS typically uses one of these table structures:

1. **user_profiles** table (most common):
   - `id` (TEXT)
   - `clerk_user_id` (TEXT)
   - `email` (TEXT)
   - `full_name` (TEXT)
   - `role` (TEXT) - admin, editor, author, user
   - `avatar_url` (TEXT)
   - `team` (TEXT)
   - `department` (TEXT)
   - `phone` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

2. **users** table (alternative):
   - Similar structure but may use UUID for `id`
   - May have additional CMS-specific fields

3. **editors** or **authors** tables (CMS-specific):
   - May have separate tables for different user types
   - The system will automatically detect and query these

## Step 4: Sync Users to CMS

### Automatic Sync

When you create or update a user in the dashboard:
1. User is synced to CMS Supabase automatically
2. User appears in CMS `user_profiles` table
3. User can log in to CMS with synced credentials

### Manual Sync

1. Go to **User Management** in dashboard
2. Find the user you want to sync
3. Click **"Sync"** button
4. Select **CMS** from the list
5. Click **"Sync to CMS"**

## Step 5: Verify CMS Connection

### Check if User Synced

1. Go to CMS Supabase Dashboard
2. Open **Table Editor**
3. Check `user_profiles` table
4. Verify user appears with correct data

### Test CMS Login

1. Go to your CMS application
2. Try logging in with synced user credentials
3. Verify user has correct role and permissions

## CMS Integration Features

✅ **User Management**: View all CMS users from dashboard
✅ **Role Management**: Assign CMS-specific roles (admin, editor, author, user)
✅ **User Editing**: Edit CMS users directly from dashboard
✅ **User Deletion**: Remove users from CMS database
✅ **Multi-Table Support**: Automatically detects and queries CMS tables (user_profiles, users, editors, authors)

## Troubleshooting

### User Not Syncing to CMS

1. Check CMS Supabase credentials are configured
2. Verify CMS database has `user_profiles` table
3. Check RLS policies allow writes
4. Verify service key is set (for RLS bypass)

### CMS Login Not Working

1. Verify user exists in CMS `user_profiles` table
2. Check user has correct role assigned
3. Verify CMS application is using correct Supabase credentials
4. Check if CMS needs additional setup in `auth.users`

### Can't See CMS Users

1. Click on CMS site card in dashboard
2. Verify CMS Supabase credentials are correct
3. Check if CMS database has users
4. Verify table name matches (user_profiles, users, etc.)

## Next Steps

- [ ] CMS site added to dashboard
- [ ] CMS Supabase credentials configured
- [ ] CMS database schema set up
- [ ] User synced to CMS
- [ ] CMS login tested
- [ ] CMS roles verified

## Support

For issues or questions:
- Check `ADD_NEW_SITE_GUIDE.md` for general site setup
- Check `MULTI_DATABASE_SYNC.md` for sync details
- Review CMS Supabase logs for errors
