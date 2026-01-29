# How to Verify HRMS Connection in Dashboard

## Step 1: View HRMS Site in Dashboard

1. **Open your dashboard**: http://localhost:3000
2. **Scroll down** to the "Connected Applications" section
3. **Look for HRMS site card** with:
   - Icon: 💼
   - Name: "HRMS System"
   - Status: Should show as "active" (green checkmark)

## Step 2: Verify Supabase Credentials

1. **Find the HRMS site card** in the dashboard
2. **Click the Database icon (🗄️)** in the top-right of the HRMS card
3. **Check the configuration modal**:
   - Should show Supabase URL: `https://snjtkvvmjqizdfyqbyzd.supabase.co`
   - Should show "✅ Configured" for the Anon Key
4. **Click "Test Connection"** button
   - Should show: "✅ Connection successful!"

## Step 3: Test via API

Visit this URL in your browser:
```
http://localhost:3000/api/test/hrms-connection
```

You should see:
```json
{
  "success": true,
  "connected": true,
  "message": "Connection successful! HRMS Supabase is accessible"
}
```

## Step 4: Check Database (Optional)

1. Go to [HRMS Supabase Dashboard](https://supabase.com/dashboard/project/snjtkvvmjqizdfyqbyzd)
2. Open **Table Editor**
3. Check if `user_profiles` table exists
4. It should be empty for now (users will sync here)

## Step 5: Test User Sync (When Ready)

1. **Add a test user** in the dashboard (when user management is set up)
2. **Go to "User Data Sync"** section
3. **Click "Sync All Users"** or sync individual user
4. **Check sync status** - should show HRMS as "success" or "pending"
5. **Verify in HRMS Supabase**:
   ```sql
   SELECT * FROM public.user_profiles;
   ```
   You should see the synced user!

## What You Should See

### In Dashboard:
- ✅ HRMS site card visible
- ✅ Status shows "active" (green checkmark)
- ✅ Database icon available
- ✅ Supabase credentials configured

### In HRMS Supabase:
- ✅ `user_profiles` table exists
- ✅ Ready to receive synced users

## Troubleshooting

### HRMS site not showing?
- Refresh the dashboard page
- Check if SQL ran successfully
- Verify site was added to database:
  ```sql
  SELECT * FROM public.connected_sites WHERE name = 'hrms';
  ```

### Connection test fails?
- Verify Supabase URL is correct
- Check Anon Key is valid
- Ensure HRMS Supabase is accessible
- Check if `user_profiles` table exists in HRMS Supabase

### Can't see Database icon?
- Make sure you're looking at the HRMS site card
- The icon is in the top-right corner of each site card
- It looks like: 🗄️

Your HRMS site should now be visible and ready in the dashboard!
