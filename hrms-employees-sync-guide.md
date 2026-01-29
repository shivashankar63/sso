# HRMS Employees Table Sync Guide

## HRMS Schema Understanding

Your HRMS uses:
- **`employees` table** - Main user table (references `auth.users(id)`)
- **`user_profiles` table** - Created by our sync (stores password for login)
- **`auth.users`** - Supabase auth users

## How Sync Works Now

### For Existing Employees:

1. **Find employee by email** in `employees` table
2. **Update employee data**:
   - `full_name` → `employees.full_name`
   - `department` → `employees.department`
   - `email` → `employees.email` (if different)
3. **Update password** in `user_profiles` table (for login)

### For New Users:

1. **Create in `user_profiles`** table:
   - Stores email, name, password_hash
   - Used for login authentication
2. **Employee record** needs to be created in HRMS:
   - HRMS should create `auth.users` entry
   - Then create `employees` record referencing it
   - Or we can create a trigger/function to auto-create

## Current Sync Behavior

✅ **Existing employees**: Updated automatically  
✅ **Password**: Synced to `user_profiles` table  
⚠️ **New users**: Profile created, but employee record needs HRMS to create

## Option 1: Auto-Create Employees (Recommended)

Create a function in HRMS that auto-creates employee when user_profiles is created:

```sql
-- Run this in HRMS Supabase
CREATE OR REPLACE FUNCTION auto_create_employee_from_profile()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if employee already exists
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = NEW.email) THEN
    -- Create auth.users entry first (requires service role)
    -- Then create employees record
    -- This is complex, so we'll handle it differently
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_profile_created
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION auto_create_employee_from_profile();
```

## Option 2: Manual Employee Creation

When new user is synced:
1. User appears in `user_profiles` table
2. HRMS admin creates employee record manually
3. Link employee.id to auth.users.id

## Option 3: Update Sync to Create Employees Directly

We can update sync to:
1. Check if employee exists
2. If not, create employee record (but need auth.users first)

## Recommended Approach

**For now:**
- Sync updates existing employees ✅
- Sync creates user_profiles for login ✅
- New employees need to be created in HRMS manually or via trigger

**Later:**
- Add function to auto-create employees from user_profiles
- Or update sync to handle auth.users creation

## Testing

1. **Sync existing user**: Should update employee record
2. **Sync new user**: Should create user_profiles, employee needs manual creation
3. **Check HRMS**: Employee should have updated data

The sync now works with your existing HRMS `employees` table!
