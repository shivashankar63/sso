# Fix: Site Not Showing + user_sync_status Error

## Two Issues to Fix

### Issue 1: user_sync_status Error
**Error**: "Could not find the table 'public.user_sync_status'"

**Fix**: Run `user-sync-schema.sql` in Supabase

### Issue 2: HRMS Site Not Showing
**Problem**: Site added but not visible in dashboard

**Fix**: Verify site exists and refresh

## Step-by-Step Fix

### Step 1: Check if Site Exists

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/snvyotfofpdkheecupho)
2. Open **SQL Editor**
3. Run this:
   ```sql
   SELECT * FROM public.connected_sites WHERE name = 'hrms';
   ```

**If you see results**: Site exists ✅ - Go to Step 2
**If no results**: Site doesn't exist - Run `add-hrms-site.sql` first

### Step 2: Run Required Schemas

Run these in order in Supabase SQL Editor:

1. **connected-sites-schema.sql** (if not run yet)
   - Creates `connected_sites` table

2. **update-sites-schema.sql** (if not run yet)
   - Adds Supabase credential columns

3. **user-sync-schema.sql** (to fix the error)
   - Creates `user_sync_status` view
   - This fixes the yellow error message

4. **add-hrms-site.sql** (if site doesn't exist)
   - Adds HRMS site with credentials

### Step 3: Refresh Dashboard

1. **Hard refresh browser**: `Ctrl + Shift + R`
2. **Check browser console** (F12) for errors
3. **Look for HRMS site** in "Connected Applications" section

## Quick SQL to Check Everything

Run this in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT 'connected_sites' as table_name, 
       EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'connected_sites') as exists;

-- Check if view exists
SELECT 'user_sync_status' as view_name,
       EXISTS (SELECT FROM information_schema.views 
               WHERE table_schema = 'public' 
               AND table_name = 'user_sync_status') as exists;

-- Check all sites
SELECT name, display_name, status, is_active 
FROM public.connected_sites;
```

## After Fixing

You should see:
- ✅ HRMS site card in dashboard
- ✅ No error messages
- ✅ Database icon (🗄️) on HRMS card
- ✅ Site status showing

## Still Not Working?

1. **Check Supabase connection**:
   - Verify `.env.local` has correct Supabase URL and key
   - Check browser console for connection errors

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

3. **Clear browser cache** and refresh
