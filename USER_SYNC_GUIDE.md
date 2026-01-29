# User Data Sync Guide

This guide explains how user data is synced across all your connected websites.

## How It Works

When you add or update a user in the SSO Dashboard, that user data is automatically synced to all connected sites. This is the core of SSO - **one user, available everywhere**.

## Architecture

```
SSO Dashboard (Central Hub)
    ↓
User Created/Updated
    ↓
Sync to All Sites:
    ├──→ HRMS Site
    ├──→ CMS Site  
    ├──→ Sales Site
    └──→ Garage Site
```

## Step 1: Set Up Database

Run the user sync schema:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/snvyotfofpdkheecupho)
2. Open **SQL Editor**
3. Run `user-sync-schema.sql`

This creates:
- `user_sync_log` table - Tracks sync status
- Helper functions for syncing
- Views for sync status

## Step 2: How User Sync Works

### Automatic Sync Flow

1. **User Added in Dashboard**
   - User profile created in `user_profiles` table
   - Sync job queued for all active sites
   - Each site receives user data via API

2. **User Updated**
   - Profile updated in dashboard
   - Changes synced to all sites
   - Each site updates their local user data

3. **User Deleted**
   - User marked as inactive
   - Deletion synced to all sites
   - Sites remove user access

### Manual Sync

You can also manually sync:
- **Sync All Users**: Syncs all users to all sites
- **Sync Single User**: Syncs one user to all sites
- **View Sync Status**: See which users are synced to which sites

## Step 3: Integrating with Your Sites

For each of your websites, you need to add an API endpoint to receive user data:

### Example: User Sync Endpoint (for your sites)

```javascript
// In your HRMS/CMS/Sales/Garage site
// POST /api/users/sync
export async function POST(request) {
  const { email, full_name, role } = await request.json();
  
  // Verify request is from SSO Dashboard (add authentication)
  // Create or update user in your local database
  // Return success
  
  return Response.json({ success: true });
}
```

### SSO Dashboard Calls Your Sites

When syncing, the dashboard will:
1. Call each site's sync endpoint
2. Send user data (email, name, role)
3. Track sync status
4. Retry on failure

## Step 4: Using the Sync Manager

1. **Open Dashboard**: http://localhost:3000
2. **Scroll to "User Data Sync"** section
3. **View Sync Status**: See which users are synced to which sites
4. **Sync All Users**: Click "Sync All Users" to sync everyone
5. **Sync Single User**: Click refresh icon next to a user

## Database Tables

### user_sync_log
Tracks every sync operation:
- Which user was synced
- Which site it was synced to
- Success/failure status
- Error messages
- Timestamps

### user_sync_status (View)
Shows current sync status for all users across all sites.

## API Endpoints

### Sync Single User
```bash
POST /api/sync/user
Body: { "userId": "user_123" }
```

### Sync All Users
```bash
POST /api/sync/all-users
```

### Get Sync Status
```bash
GET /api/sync/user?userId=user_123
```

## Next Steps

1. ✅ Run `user-sync-schema.sql` in Supabase
2. ✅ Add your sites using Connected Sites Manager
3. ⏳ Add API endpoints to your sites to receive user data
4. ⏳ Configure authentication between dashboard and sites
5. ⏳ Test user sync

## Security

When you enable authentication:
- Add API keys or JWT tokens for site-to-site communication
- Verify requests are from trusted sources
- Encrypt sensitive data in transit

## Benefits

✅ **One Source of Truth**: User data managed in one place  
✅ **Automatic Sync**: Changes propagate to all sites  
✅ **Consistent Data**: Same user info everywhere  
✅ **Easy Management**: Add user once, available everywhere  
✅ **Scalable**: Works with 2 sites or 100+ sites

This is the power of SSO - unified user management across all your applications!
