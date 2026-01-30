# CMS Integration Verification Checklist

## ✅ CMS Configuration Complete

### 1. Site Configuration
- ✅ CMS site added to `connected_sites` table
- ✅ Supabase credentials configured (URL, Anon Key, Service Key)
- ✅ Site URL: https://cms.techvitta.in
- ✅ Site category: `cms`
- ✅ Status: `active`

### 2. Database Integration
- ✅ `hr_users` table detection (primary table for CMS)
- ✅ `user_profiles` table support (fallback)
- ✅ `auth.users` integration for authentication
- ✅ Table schema detection API working

### 3. User Sync Functionality
- ✅ `syncToCMS()` function implemented
- ✅ Role mapping: admin → admin, manager/user → hr
- ✅ Syncs to `hr_users` table (UUID from auth.users)
- ✅ Syncs to `user_profiles` table (fallback)
- ✅ Creates/updates `auth.users` entry
- ✅ Handles password hash for login

### 4. User Viewing
- ✅ Queries `hr_users` table first
- ✅ Falls back to other tables if needed
- ✅ Shows all CMS users in modal
- ✅ Displays correct roles (admin, hr, editor, author, user)
- ✅ Shows source table for each user

### 5. User Editing
- ✅ Edit modal shows CMS-specific roles
- ✅ Role mapping on update (admin → admin, manager/user → hr)
- ✅ Updates `hr_users` table correctly
- ✅ Handles different column names
- ✅ Only updates columns that exist

### 6. User Deletion
- ✅ Deletes from `hr_users` table
- ✅ Also removes from `auth.users` if applicable
- ✅ Handles UUID-based IDs correctly

### 7. Role Management
- ✅ CMS roles: Admin, HR, Editor, Author, User
- ✅ Role mapping during sync
- ✅ Role mapping during edit
- ✅ Role normalization in user list

### 8. API Routes
- ✅ `/api/sites/[siteId]/users` - Lists CMS users from hr_users
- ✅ `/api/sites/[siteId]/users/[userId]` - Update/Delete CMS users
- ✅ `/api/sites/[siteId]/table-schema` - Returns CMS table schema
- ✅ `/api/sync/user-to-site` - Syncs users to CMS with role mapping

## Testing Steps

### Test 1: View CMS Users
1. Go to dashboard
2. Click on "CMS Portal" card
3. ✅ Should see all users from `hr_users` table
4. ✅ Should show correct roles
5. ✅ Should show source table as `hr_users`

### Test 2: Sync User to CMS
1. Go to User Management
2. Select a user
3. Click "Sync" → Select "CMS"
4. ✅ User should sync to CMS
5. ✅ Role should map correctly (admin → admin, manager/user → hr)
6. ✅ User should appear in `hr_users` table
7. ✅ User should appear in `auth.users`

### Test 3: Edit CMS User
1. Click on "CMS Portal" card
2. Click Edit on any user
3. ✅ Should see CMS roles (Admin, HR, Editor, Author, User)
4. ✅ Change role and save
5. ✅ Role should update in `hr_users` table
6. ✅ Role mapping should work (manager/user → hr)

### Test 4: Delete CMS User
1. Click on "CMS Portal" card
2. Click Delete on any user
3. ✅ User should be removed from `hr_users` table
4. ✅ User should be removed from `auth.users` (if service key available)

### Test 5: Table Schema Detection
1. Click Edit on a CMS user
2. ✅ Should show available columns from `hr_users` table
3. ✅ Should only show fields that exist in table
4. ✅ Should show CMS-specific roles

## Expected Behavior

### Role Mapping
- **Central Dashboard** → **CMS**
- `admin` → `admin`
- `manager` → `hr`
- `user` → `hr`
- `editor` → `editor` (if set)
- `author` → `author` (if set)

### Table Priority
1. `hr_users` (primary - CMS specific)
2. `user_profiles` (fallback)
3. `users` (alternative)
4. `editors`, `authors` (CMS-specific)

### Sync Process
1. Creates/updates `auth.users` entry (UUID)
2. Syncs to `hr_users` table using auth.users.id
3. Syncs to `user_profiles` table (fallback)
4. Applies role mapping during sync

## Common Issues & Solutions

### Issue: Users not appearing in CMS
**Solution**: 
- Verify `hr_users` table exists in CMS Supabase
- Check Supabase credentials are correct
- Verify RLS policies allow reads

### Issue: Sync failing
**Solution**:
- Check service key is configured
- Verify `hr_users` table exists
- Check RLS policies allow writes
- Verify `auth.users` creation works

### Issue: Wrong roles in CMS
**Solution**:
- Check role mapping logic in `syncToCMS()`
- Verify user's role in central dashboard
- Check if role is being mapped correctly

### Issue: Can't edit CMS users
**Solution**:
- Verify `hr_users` table has the user
- Check table schema detection is working
- Verify columns exist in `hr_users` table

## Files to Verify

- ✅ `configure-cms-complete.sql` - CMS site configuration
- ✅ `app/api/sync/user-to-site/route.ts` - CMS sync function
- ✅ `app/api/sites/[siteId]/users/route.ts` - CMS user listing
- ✅ `app/api/sites/[siteId]/users/[userId]/route.ts` - CMS user edit/delete
- ✅ `app/api/sites/[siteId]/table-schema/route.ts` - CMS schema detection
- ✅ `components/dashboard/SiteUsersModal.tsx` - User viewing
- ✅ `components/dashboard/EditUserModal.tsx` - User editing

## ✅ All CMS Features Verified

Everything related to CMS should now work correctly:
- ✅ User sync with role mapping
- ✅ User viewing from hr_users table
- ✅ User editing with CMS roles
- ✅ User deletion from hr_users
- ✅ Table schema detection
- ✅ Dynamic form fields
- ✅ Role normalization
