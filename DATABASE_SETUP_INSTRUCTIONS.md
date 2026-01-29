# Database Setup Instructions

Follow these steps to set up your Supabase database for the SSO Dashboard.

## Quick Setup (Recommended)

### Step 1: Run the Complete Setup Script

1. Go to your Supabase project: https://supabase.com/dashboard/project/snvyotfofpdkheecupho
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `complete-database-setup.sql` from your project
5. Copy the **entire contents** of the file
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

This will create:
- ✅ `get_user_id()` function (for Clerk JWT integration)
- ✅ `user_profiles` table (user information)
- ✅ `user_roles` table (role management)
- ✅ `app_access` table (app permissions)
- ✅ `audit_logs` table (activity tracking)
- ✅ Helper functions and views
- ✅ All indexes and security policies

### Step 2: Verify Setup

Run this query to verify everything was created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_roles', 'app_access', 'audit_logs');
```

You should see all 4 tables listed.

### Step 3: Test the Function

```sql
-- This should return null (no user authenticated yet)
SELECT get_user_id();
```

## Manual Setup (Alternative)

If you prefer to run scripts separately:

1. **First**: Run `supabase-migration.sql` (creates `get_user_id()` function)
2. **Then**: Run `supabase-clerk-schema.sql` (creates all tables)

## Adding Sample Data (Optional)

After setup, you can add test data:

1. Get your Clerk user ID (from Clerk Dashboard or after signing up)
2. Open `sample-data.sql`
3. Replace `'user_2abc123xyz'` with your actual Clerk user ID
4. Run the script in SQL Editor

## Important: JWT Secret Configuration

⚠️ **Before using the database with Clerk:**

1. Go to **Project Settings > API** in Supabase
2. Scroll to **JWT Settings**
3. Replace the JWT Secret with the one from Clerk (after you set up Clerk)
4. This allows Supabase to trust tokens from Clerk

## Database Structure

### Tables Created

1. **user_profiles** - Main user information
   - Stores: email, name, role, team, department
   - Linked to Clerk user IDs

2. **user_roles** - Role assignments
   - Manages roles per user per application
   - Supports role expiration

3. **app_access** - Application permissions
   - Tracks which users can access which apps
   - Supports access revocation

4. **audit_logs** - Activity tracking
   - Logs user actions and events
   - Includes metadata for custom tracking

### Helper Functions

- `get_user_id()` - Extracts Clerk user ID from JWT
- `get_user_role(user_id)` - Gets user's role
- `has_app_access(app_name, user_id)` - Checks app access
- `get_user_apps(user_id)` - Lists user's accessible apps

### Views

- `user_summary` - Combined view of users with apps and roles

## Testing Queries

After setup, try these queries:

```sql
-- View all users
SELECT * FROM public.user_profiles;

-- View user summary
SELECT * FROM public.user_summary;

-- Check app access (replace with actual user ID)
SELECT has_app_access('sales', 'your_clerk_user_id');
```

## Troubleshooting

### Error: "function get_user_id() does not exist"
- Make sure you ran `supabase-migration.sql` first
- Or run the complete setup script which includes it

### Error: "permission denied"
- Check that RLS policies are created
- Verify you're using the correct user context

### Tables not showing up
- Refresh the Supabase dashboard
- Check the SQL Editor for any error messages
- Verify you're in the correct project

## Next Steps

1. ✅ Database setup complete
2. ⏳ Configure Clerk JWT Secret in Supabase
3. ⏳ Set up Clerk authentication
4. ⏳ Test user creation and access

## Support

If you encounter issues:
- Check the SQL Editor error messages
- Verify all scripts ran successfully
- Ensure you're using the correct Supabase project
