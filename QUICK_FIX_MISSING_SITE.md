# Quick Fix: Site Not Showing in Dashboard

## Issue
The HRMS site you added doesn't appear in the dashboard.

## Quick Fix Steps

### Step 1: Verify Site Was Added to Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/snvyotfofpdkheecupho)
2. Open **SQL Editor**
3. Run this query:
   ```sql
   SELECT * FROM public.connected_sites WHERE name = 'hrms';
   ```

**If you see the HRMS site:**
- The site is in the database ✅
- The issue is with the dashboard loading it
- Go to Step 2

**If you DON'T see the HRMS site:**
- The site wasn't added to the database
- Run `add-hrms-site.sql` again in Supabase SQL Editor
- Then refresh the dashboard

### Step 2: Check Dashboard Loading

1. **Open browser console** (F12)
2. **Check for errors** in the console
3. **Look for network errors** in Network tab
4. **Refresh the page** (Ctrl+Shift+R)

### Step 3: Run Required Schemas

Make sure these are run in your **CENTRAL Supabase**:

1. ✅ `connected-sites-schema.sql` - Creates connected_sites table
2. ✅ `update-sites-schema.sql` - Adds Supabase credential columns
3. ✅ `add-hrms-site.sql` - Adds HRMS site

### Step 4: Fix user_sync_status Error

The error shows `user_sync_status` view doesn't exist. Run:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/snvyotfofpdkheecupho)
2. Open **SQL Editor**
3. Run `user-sync-schema.sql`
4. This creates the `user_sync_status` view

## Common Issues

### Issue 1: Site Not in Database
**Solution**: Run `add-hrms-site.sql` in Supabase SQL Editor

### Issue 2: Table Doesn't Exist
**Solution**: Run `connected-sites-schema.sql` first

### Issue 3: Dashboard Not Loading Sites
**Solution**: 
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Clear browser cache and refresh

### Issue 4: user_sync_status Error
**Solution**: Run `user-sync-schema.sql` in Supabase

## Verification

After fixing, you should see:
- ✅ HRMS site card in dashboard
- ✅ No error messages
- ✅ Database icon (🗄️) on HRMS card
- ✅ Site status (active/pending)

## Still Not Working?

1. Check Supabase connection:
   - Verify `.env.local` has correct Supabase URL and key
   - Test connection in browser console

2. Check database:
   ```sql
   SELECT * FROM public.connected_sites;
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```
