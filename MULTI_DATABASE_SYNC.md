# Multi-Database User Sync Guide

This guide explains how user data is synced from the central SSO Dashboard to each site's Supabase database.

## Architecture

```
Central SSO Dashboard
    ↓ (Has its own Supabase)
User Created/Updated
    ↓
Sync to Each Site's Supabase:
    ├──→ HRMS Site Supabase (writes user data)
    ├──→ CMS Site Supabase (writes user data)
    ├──→ Sales Site Supabase (writes user data)
    └──→ Garage Site Supabase (writes user data)
```

## How It Works

1. **Central Dashboard** manages all users in its Supabase database
2. **Each Site** has its own Supabase database
3. **When user is created/updated** in central dashboard:
   - User data is written to central database
   - Same user data is synced to each site's Supabase database
   - Each site's `user_profiles` table gets the user

## Step 1: Configure Each Site's Supabase

For each connected site, you need to add its Supabase credentials:

1. **In Dashboard**: Click the database icon (🗄️) next to a site
2. **Enter Supabase credentials**:
   - **Supabase URL**: `https://hrms-site.supabase.co` (from site's Supabase project)
   - **Supabase Anon Key**: The anon/public key from site's Supabase
3. **Click "Test Connection"** to verify
4. **Click "Save Credentials"**

### Where to Get Supabase Credentials

For each of your sites (HRMS, CMS, Sales, Garage):

1. Go to that site's Supabase project dashboard
2. Navigate to **Project Settings > API**
3. Copy:
   - **Project URL** → This is the Supabase URL
   - **anon/public key** → This is the Anon Key

## Step 2: Run Database Schema in Each Site

Each site's Supabase database needs the `user_profiles` table. Run this in **each site's Supabase**:

```sql
-- Run this in HRMS Supabase, CMS Supabase, Sales Supabase, Garage Supabase
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    team TEXT,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Step 3: How Sync Works

### When User is Created in Dashboard:

1. User added to **central dashboard's Supabase**
2. Dashboard reads all active connected sites
3. For each site:
   - Gets site's Supabase URL and Anon Key
   - Creates Supabase client for that site
   - Writes user to that site's `user_profiles` table
   - Logs sync status

### When User is Updated:

1. User updated in **central dashboard's Supabase**
2. Dashboard syncs changes to all sites
3. Each site's database is updated with new user data

## Step 4: Sync Process

### Automatic Sync
- Happens when user is created/updated in dashboard
- Uses each site's Supabase credentials
- Writes directly to each site's database

### Manual Sync
- Use "Sync All Users" button in dashboard
- Or sync individual users
- Useful for initial setup or fixing sync issues

## Database Structure

### Central Dashboard Database
- `user_profiles` - Master user list
- `connected_sites` - Site configurations (with Supabase credentials)
- `user_sync_log` - Sync history

### Each Site's Database
- `user_profiles` - Local copy of users (synced from central)

## Security

### Current Setup (No Auth)
- Supabase Anon Keys are stored in database
- Anyone with dashboard access can see them
- **For production**: Encrypt service keys

### When Authentication is Enabled
- Add API authentication between dashboard and sites
- Use service role keys (more secure)
- Encrypt credentials in database

## Example: Adding Your First Site

1. **Add Site**:
   - Name: `hrms`
   - URL: `https://hrms.example.com`
   - Click "Add Site"

2. **Configure Supabase**:
   - Click database icon (🗄️)
   - Enter HRMS Supabase URL: `https://hrms-db.supabase.co`
   - Enter HRMS Anon Key: `eyJhbGciOiJIUzI1NiIs...`
   - Test connection
   - Save

3. **Add User**:
   - User is created in central database
   - Automatically synced to HRMS Supabase
   - User now exists in both databases

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
- Check sync status in "User Data Sync" section
- Verify site's Supabase credentials are correct
- Check site's database has `user_profiles` table
- Look at sync logs for error messages

## Benefits

✅ **Centralized Control**: Manage all users from one place  
✅ **Automatic Sync**: Changes propagate to all sites  
✅ **Independent Databases**: Each site keeps its own data  
✅ **Scalable**: Add unlimited sites  
✅ **Real-time**: Users available immediately after sync

This is true SSO - one user database controlling user data across all your sites!
