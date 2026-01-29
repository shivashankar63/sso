# How to Add Service Key to HRMS Site

## Quick Steps

1. **Go to Dashboard** → Connected Sites section
2. **Find HRMS site** in the list
3. **Click the Database icon (🗄️)** next to HRMS
4. **Paste your service key** in the "Supabase Service Key" field:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuanRrdnZtanFpemRmeXFieXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ3MTc4OSwiZXhwIjoyMDY4MDQ3Nzg5fQ.blV3qDpiRlQjRrS0kwDf6PqIW09STvUFudXNSboH2sY
   ```
5. **Click "Save Credentials"**
6. **Try syncing again** - should work now!

## Why Service Key?

- ✅ **Bypasses RLS policies** - Writes will actually succeed
- ✅ **More reliable** - No silent failures
- ✅ **Required for syncing** - Anon key may be blocked by RLS

## What Changed

I've updated the configuration form to include:
- ✅ Service Key field (with show/hide toggle)
- ✅ Warning if service key is not set
- ✅ Status indicator showing if service key is configured

## After Adding Service Key

1. **Sync a user** - Should work now!
2. **Check server terminal** - Should see "Using: Service Key (bypasses RLS)"
3. **Verify in HRMS** - User should appear in `user_profiles` table

The service key you provided is now ready to be added to the dashboard!
