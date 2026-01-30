# ✅ CMS Site Configuration Complete!

## CMS Site Details

- **Site Name**: cms
- **Display Name**: CMS Portal
- **Site URL**: https://cms.techvitta.in
- **Icon**: 📋
- **Category**: cms
- **Status**: active

## Supabase Configuration

- **Supabase URL**: https://qzgzmytmfoozociuhgtp.supabase.co
- **Project ID**: qzgzmytmfoozociuhgtp
- **Dashboard**: https://supabase.com/dashboard/project/qzgzmytmfoozociuhgtp
- **Anon Key**: ✅ Configured
- **Service Key**: ✅ Configured

## Database Schema

- **Main Table**: `hr_users` (CMS-specific)
- **Auth Table**: `auth.users`
- **Fallback Table**: `user_profiles`

## Role Mapping

CMS uses the following role mapping:
- **admin** (central) → **admin** (CMS)
- **manager/user** (central) → **hr** (CMS)
- **editor** → **editor** (CMS)
- **author** → **author** (CMS)

## What Was Configured

### 1. ✅ SQL Configuration File
- `configure-cms-complete.sql` - Ready to run with your credentials

### 2. ✅ API Integration
- CMS detection in all API routes
- CMS-specific sync function (`syncToCMS`)
- `hr_users` table support
- Role mapping (admin → admin, manager/user → hr)

### 3. ✅ Table Detection
- Automatically queries `hr_users` table first
- Falls back to `user_profiles`, `users`, `editors`, `authors` if needed
- Handles different column names

### 4. ✅ User Management
- View CMS users from dashboard
- Edit CMS users with correct roles
- Delete CMS users
- Dynamic form fields based on table schema

### 5. ✅ Role Support
- Admin
- HR (mapped from manager/user)
- Editor
- Author
- User

## Next Steps

### 1. Run the SQL Configuration

Go to your **Central Supabase Dashboard** and run:

```sql
-- File: configure-cms-complete.sql
-- This will add/update the CMS site with all credentials
```

Or run it directly in SQL Editor:

```sql
INSERT INTO public.connected_sites (
  name, display_name, url, icon, category, status, protocol, is_active,
  supabase_url, supabase_anon_key, supabase_service_key
)
VALUES (
  'cms', 'CMS Portal', 'https://cms.techvitta.in', '📋', 'cms', 'active', 'oauth', true,
  'https://qzgzmytmfoozociuhgtp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Z3pteXRtZm9vem9jaXVoZ3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTQwOTEsImV4cCI6MjA3Njk3MDA5MX0.w0JiBV0cIH2ZFCDB9sUgrfBPlVUy_hiujQuRInJF29I',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Z3pteXRtZm9vem9jaXVoZ3RwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM5NDA5MSwiZXhwIjoyMDc2OTcwMDkxfQ.qtE7V9jtA5ZQirn8EkL9q7BAZXlQy5o1vO5XcBAiNz0'
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  url = EXCLUDED.url,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  supabase_url = EXCLUDED.supabase_url,
  supabase_anon_key = EXCLUDED.supabase_anon_key,
  supabase_service_key = EXCLUDED.supabase_service_key,
  updated_at = NOW();
```

### 2. Verify CMS Site in Dashboard

1. Go to your SSO Dashboard
2. Check "Connected Sites" section
3. You should see "CMS Portal" with icon 📋
4. Click on it to view CMS users

### 3. Test User Sync

1. Go to User Management
2. Create or select a user
3. Click "Sync" → Select "CMS"
4. User will be synced to CMS `hr_users` table with correct role mapping

### 4. View CMS Users

1. Click on "CMS Portal" card in Connected Sites
2. You'll see all users from CMS `hr_users` table
3. You can edit/delete users directly

## Features Available

✅ **View CMS Users** - Click CMS site card to see all users
✅ **Edit CMS Users** - Edit with CMS-specific roles (admin, hr, editor, author)
✅ **Delete CMS Users** - Remove users from CMS database
✅ **Sync Users** - Automatic role mapping (admin → admin, manager/user → hr)
✅ **Multi-Table Support** - Queries `hr_users` first, falls back to other tables

## Role Mapping Details

When syncing users to CMS:
- **Central Dashboard Role** → **CMS Role**
- `admin` → `admin`
- `manager` → `hr`
- `user` → `hr`
- `editor` → `editor` (if set)
- `author` → `author` (if set)

## Troubleshooting

### CMS Site Not Appearing
- Run `configure-cms-complete.sql` in Central Supabase
- Refresh dashboard page

### Can't See CMS Users
- Verify CMS Supabase credentials are correct
- Check if `hr_users` table exists in CMS Supabase
- Verify table has data

### User Sync Failing
- Check CMS Supabase service key is configured
- Verify `hr_users` table exists
- Check RLS policies allow writes

### Wrong Roles in CMS
- Verify role mapping logic in sync function
- Check user's role in central dashboard
- Role should map: admin → admin, manager/user → hr

## Files Updated

- ✅ `configure-cms-complete.sql` - CMS configuration with your credentials
- ✅ `app/api/sync/user-to-site/route.ts` - Added `syncToCMS()` function
- ✅ `app/api/sites/[siteId]/users/route.ts` - Added `hr_users` table support
- ✅ `app/api/sites/[siteId]/table-schema/route.ts` - Added CMS roles and `hr_users`
- ✅ `CMS_SITE_SETUP.md` - Complete setup guide
- ✅ `CMS_CONFIGURATION_COMPLETE.md` - This file

## ✅ CMS Integration Complete!

Your CMS site is now fully integrated with the SSO Dashboard. You can:
- View all CMS users
- Edit CMS users with correct roles
- Delete CMS users
- Sync users with automatic role mapping

Enjoy! 🎉
