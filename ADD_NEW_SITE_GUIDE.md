# Guide: Adding a New Site to SSO Dashboard

## Method 1: Add Site via Dashboard UI (Recommended)

### Step 1: Open Dashboard

1. Go to: `http://localhost:3000`
2. Scroll down to **"Connected Applications"** section
3. Find **"Connected Sites"** section

### Step 2: Click "Add Site" Button

Click the **"Add Site"** button at the top right of the Connected Sites section.

### Step 3: Fill in Site Information

Fill in the form with your site details:

**Required Fields:**
- **Site Name**: Unique identifier (e.g., `cms`, `sales`, `garage`)
  - Must be lowercase, no spaces
  - Example: `cms`, `sales-portal`, `garage-system`
- **Display Name**: Friendly name (e.g., `CMS System`, `Sales Portal`)
- **URL**: Full URL of your site (e.g., `https://cms.example.com`)

**Optional Fields:**
- **Icon**: Emoji or icon (e.g., `📝`, `💰`, `🔧`)
- **Category**: Category tag (e.g., `cms`, `sales`, `garage`)
- **Description**: Brief description of the site

### Step 4: Click "Add Site"

After filling the form, click **"Add Site"** button.

The site will appear in the list with status "pending".

### Step 5: Configure Supabase Credentials

**Important:** To sync users to this site, you need to configure its Supabase database.

1. **Find your new site** in the list
2. **Click the Database icon (🗄️)** next to the site
3. **Enter Supabase credentials:**
   - **Supabase URL**: From your site's Supabase project settings
   - **Supabase Anon Key**: From your site's Supabase project settings
   - **Supabase Service Key**: (Optional but recommended for sync)
4. **Click "Test Connection"** to verify
5. **Click "Save Credentials"**

### Step 6: Set Up Site's Database Schema

Before syncing users, set up the site's Supabase database:

1. Go to your site's Supabase project dashboard
2. Open **SQL Editor**
3. Run `site-supabase-schema.sql` to create the `user_profiles` table
4. (Optional) Run `fix-hrms-rls-simple.sql` to disable RLS for testing

### Step 7: Sync Users

After configuring credentials:

1. Go to **"User Management"** section
2. Find a user
3. Click **"Sync"** button
4. Select your new site
5. Click **"Sync to [Site Name]"**

Watch the server terminal for sync confirmation!

---

## Method 2: Add Site via SQL (Alternative)

If you prefer SQL, you can add a site directly:

### Step 1: Prepare Site Information

Gather:
- Site name (e.g., `cms`)
- Display name (e.g., `CMS System`)
- URL (e.g., `https://cms.example.com`)
- Supabase URL
- Supabase Anon Key
- Supabase Service Key (optional)

### Step 2: Run SQL Script

Create a file `add-cms-site.sql` (or similar) with:

```sql
-- Add CMS Site
INSERT INTO public.connected_sites (
  name,
  display_name,
  url,
  icon,
  category,
  status,
  protocol,
  is_active,
  description,
  supabase_url,
  supabase_anon_key,
  supabase_service_key
) VALUES (
  'cms',                    -- Site name (unique)
  'CMS System',             -- Display name
  'https://cms.example.com', -- Site URL
  '📝',                     -- Icon emoji
  'cms',                    -- Category
  'active',                 -- Status
  'oauth',                  -- Protocol
  true,                     -- Is active
  'Content Management System - Connected via SSO Dashboard',
  'https://your-cms-supabase.supabase.co',  -- Supabase URL
  'your-anon-key-here',     -- Supabase Anon Key
  'your-service-key-here'   -- Supabase Service Key (optional)
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  url = EXCLUDED.url,
  supabase_url = EXCLUDED.supabase_url,
  supabase_anon_key = EXCLUDED.supabase_anon_key,
  supabase_service_key = EXCLUDED.supabase_service_key,
  updated_at = NOW();
```

### Step 3: Run in Central Supabase

1. Go to Central Supabase Dashboard
2. Open **SQL Editor**
3. Paste and run the SQL script

---

## Where to Get Supabase Credentials

For each site's Supabase:

1. Go to **Supabase Dashboard** → Your Site's Project
2. Navigate to **Project Settings > API**
3. Copy:
   - **Project URL** → Use as `supabase_url`
   - **anon/public key** → Use as `supabase_anon_key`
   - **service_role key** → Use as `supabase_service_key` (keep secret!)

---

## Example: Adding CMS Site

### Via Dashboard:

1. Dashboard → Connected Sites → **Add Site**
2. Fill:
   - Site Name: `cms`
   - Display Name: `CMS System`
   - URL: `https://cms.example.com`
   - Icon: `📝`
   - Category: `cms`
3. Click **Add Site**
4. Click **Database icon** → Configure Supabase credentials
5. Test connection → Save

### Via SQL:

```sql
INSERT INTO public.connected_sites (
  name, display_name, url, icon, category, status, is_active,
  supabase_url, supabase_anon_key, supabase_service_key
) VALUES (
  'cms', 'CMS System', 'https://cms.example.com', '📝', 'cms', 'active', true,
  'https://your-cms-supabase.supabase.co',
  'your-anon-key',
  'your-service-key'
);
```

---

## After Adding Site

### 1. Set Up Site's Database

Run in **Site's Supabase**:
- `site-supabase-schema.sql` - Creates user_profiles table
- `fix-hrms-rls-simple.sql` - Disables RLS (for testing)

### 2. Test Connection

Use the **Database icon** → **Test Connection** button in dashboard.

### 3. Sync Users

- Dashboard → User Management → Find user → **Sync** → Select site

### 4. Verify Sync

Check if user synced:
```
GET /api/test/check-auth-users?email=user-email@example.com
```

---

## Quick Checklist

- [ ] Site added to dashboard (via UI or SQL)
- [ ] Supabase credentials configured
- [ ] Connection test successful
- [ ] Site's database schema set up (`site-supabase-schema.sql`)
- [ ] RLS policies configured (if needed)
- [ ] User synced to site
- [ ] Login tested on site

---

## Common Sites to Add

Based on your original plan:

1. **HRMS** ✅ (Already added)
2. **CMS** - Content Management System
3. **Sales** - Sales Portal
4. **Garage** - Garage Management System

Each follows the same process!
