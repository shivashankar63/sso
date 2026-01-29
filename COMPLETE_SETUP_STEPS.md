# Complete Setup Steps for Multi-Database SSO

Follow these steps to set up user data sync across all your sites' Supabase databases.

## Overview

- **Central Dashboard**: Has its own Supabase (manages all users)
- **Each Site**: Has its own Supabase (receives synced users)
- **Sync Process**: Dashboard writes user data to each site's Supabase

## Step 1: Set Up Central Dashboard Database

Run in **Central Dashboard's Supabase** (snvyotfofpdkheecupho):

1. `complete-database-setup.sql` - Creates user_profiles and helper functions
2. `connected-sites-schema.sql` - Creates connected_sites table
3. `update-sites-schema.sql` - Adds Supabase credential columns
4. `user-sync-schema.sql` - Creates sync tracking tables

## Step 2: Set Up Each Site's Database

For **EACH** of your sites (HRMS, CMS, Sales, Garage):

1. Go to that site's Supabase project
2. Run `site-supabase-schema.sql` in SQL Editor
3. This creates the `user_profiles` table to receive synced users

## Step 3: Add Sites to Dashboard

1. Open dashboard: http://localhost:3000
2. Scroll to "Connected Applications"
3. Click "Add Site"
4. Fill in:
   - **Site Name**: `hrms` (or `cms`, `sales`, `garage`)
   - **Display Name**: "HRMS System"
   - **URL**: Your site's URL
   - **Icon**: Choose an emoji
   - **Category**: `hrms`, `cms`, etc.

## Step 4: Configure Each Site's Supabase Credentials

For each site you added:

1. **Click the Database icon (🗄️)** next to the site
2. **Enter Supabase credentials**:
   - **Supabase URL**: From that site's Supabase project settings
   - **Supabase Anon Key**: From that site's Supabase project settings
3. **Click "Test Connection"** to verify
4. **Click "Save Credentials"**

### Where to Get Credentials

For each site's Supabase:
1. Go to Supabase Dashboard → Your Site's Project
2. Navigate to **Project Settings > API**
3. Copy:
   - **Project URL** → Supabase URL
   - **anon/public key** → Anon Key

## Step 5: Add Users

1. Users are added to central dashboard's Supabase
2. Dashboard automatically syncs to all configured sites
3. Each site's Supabase receives the user data
4. User now exists in all databases

## How Sync Works

```
User Added in Dashboard
    ↓
Central Supabase (user_profiles)
    ↓
For Each Site:
    ├──→ Get site's Supabase URL + Anon Key
    ├──→ Create Supabase client for that site
    ├──→ Write user to site's user_profiles table
    └──→ Log sync status
```

## Example: Adding Your First Site

### Site: HRMS

1. **HRMS Supabase**: Run `site-supabase-schema.sql`
2. **Dashboard**: Add site "HRMS" via UI
3. **Dashboard**: Click DB icon → Enter HRMS Supabase credentials
4. **Dashboard**: Add a user → User syncs to HRMS Supabase automatically

### Site: CMS

1. **CMS Supabase**: Run `site-supabase-schema.sql`
2. **Dashboard**: Add site "CMS" via UI
3. **Dashboard**: Click DB icon → Enter CMS Supabase credentials
4. **Dashboard**: Add a user → User syncs to CMS Supabase automatically

## Verification

After setup, verify sync:

1. **Add a user** in dashboard
2. **Check sync status** in "User Data Sync" section
3. **Verify in each site's Supabase**:
   ```sql
   SELECT * FROM public.user_profiles;
   ```
   You should see the synced user in each database.

## Troubleshooting

### "Site Supabase credentials not configured"
- Click database icon next to site
- Add Supabase URL and Anon Key
- Save and try again

### "Connection failed"
- Verify Supabase URL is correct
- Check Anon Key is valid
- Ensure site's Supabase is accessible
- Check if `user_profiles` table exists in site's database

### "User not syncing"
- Check sync status in dashboard
- Verify site's Supabase credentials
- Check site's database has `user_profiles` table
- Look at sync logs for errors

## Benefits

✅ **Centralized Control**: Manage all users from dashboard  
✅ **Automatic Sync**: Users appear in all sites automatically  
✅ **Independent Databases**: Each site keeps its own data  
✅ **Scalable**: Add unlimited sites  
✅ **Real-time**: Users available immediately

This is true SSO - one dashboard controlling user data across all your Supabase databases!
