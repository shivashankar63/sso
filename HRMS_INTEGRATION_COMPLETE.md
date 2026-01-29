# HRMS Integration Complete! 🎉

## What I've Done

✅ **Updated sync API** to work with HRMS's existing `employees` table  
✅ **Created SQL script** to ensure `user_profiles` table exists in HRMS  
✅ **Sync now handles** both `employees` and `user_profiles` tables

## How It Works

### For Existing Employees:

1. **Finds employee** by email in `employees` table
2. **Updates employee data**:
   - `full_name` → `employees.full_name`
   - `department` → `employees.department`
   - `email` → `employees.email` (if changed)
3. **Syncs password** to `user_profiles` table (for login)

### For New Users:

1. **Creates/updates** `user_profiles` table:
   - Stores email, name, password_hash
   - Used for login authentication
2. **Employee record**: Needs to be created in HRMS (or use trigger)

## Setup Steps

### Step 1: Run in CENTRAL Supabase

Run `setup-all-tables.sql` to create:
- `connected_sites` table
- `user_profiles` table
- `user_sync_log` table

### Step 2: Run in HRMS Supabase

Run `hrms-ensure-user-profiles.sql` to ensure:
- `user_profiles` table exists
- Proper indexes and RLS policies

### Step 3: Configure HRMS Site in Dashboard

1. Go to dashboard
2. Add HRMS site (if not already added)
3. Configure Supabase credentials:
   - HRMS Supabase URL
   - HRMS Supabase Anon Key

### Step 4: Sync Users

1. Create user in central dashboard
2. Click "Sync to HRMS"
3. User data will:
   - Update `employees` table (if employee exists)
   - Create/update `user_profiles` table (for login)

## Table Mapping

| Central Dashboard | HRMS Table | Column |
|------------------|------------|--------|
| `user_profiles.email` | `employees.email` | email |
| `user_profiles.full_name` | `employees.full_name` | full_name |
| `user_profiles.department` | `employees.department` | department |
| `user_profiles.password_hash` | `user_profiles.password_hash` | password_hash (for login) |

## Login Flow

1. User enters email/password in HRMS
2. HRMS checks `user_profiles` table for password
3. If valid, user is logged in
4. HRMS can then fetch employee data from `employees` table

## Testing

1. **Create user** in central dashboard with password
2. **Sync to HRMS** - should update employee if exists
3. **Check HRMS**:
   - `employees` table should have updated data
   - `user_profiles` table should have password_hash
4. **Try login** in HRMS with synced credentials

## Next Steps (Optional)

### Auto-Create Employees

If you want to auto-create employees when new users are synced, you can:

1. Create a trigger in HRMS that watches `user_profiles`
2. When new profile is created, create `auth.users` entry
3. Then create `employees` record

Or handle it manually in HRMS admin panel.

## Troubleshooting

### "Employee not found"
- Employee doesn't exist in `employees` table
- Create employee manually in HRMS, or add auto-create trigger

### "Password not working"
- Check `user_profiles` table has `password_hash`
- Verify HRMS login uses `user_profiles` for authentication

### "Sync failed"
- Check HRMS Supabase credentials in dashboard
- Verify `user_profiles` table exists in HRMS
- Check RLS policies allow operations

## Summary

✅ Sync works with existing HRMS `employees` table  
✅ Password stored in `user_profiles` for login  
✅ Existing employees get updated automatically  
✅ New users get profile created (employee needs creation)

The integration is complete! 🚀
