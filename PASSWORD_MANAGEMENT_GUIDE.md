# Password Management Guide

## How Password Management Works

### When You Create a User:

1. **Fill in the form**:
   - Email (required)
   - Full Name
   - **Password (required)** ← NEW!
   - Role, Team, Department

2. **Password is stored**:
   - Saved in central dashboard database
   - Stored in `password_hash` field
   - Synced to all connected sites

3. **User can login**:
   - Use email + password to login to any site
   - Same password works everywhere

## Where Password is Set

### In Dashboard:

1. Go to **"User Management"** section
2. Click **"Add User"** button
3. Fill in the form:
   - **Email**: `peru@example.com`
   - **Password**: `your_password_here` ← Set it here!
   - Other details...
4. Click **"Add User"**

### Password is Then:

- ✅ Stored in central dashboard database
- ✅ Synced to HRMS Supabase
- ✅ Synced to CMS Supabase (when added)
- ✅ Synced to all connected sites

## How User Logs In

### To HRMS Site:

1. Go to HRMS login page
2. Enter:
   - **Email**: `peru@example.com`
   - **Password**: The password you set in dashboard
3. Login successful!

### Same Password Works:

- ✅ HRMS site
- ✅ CMS site (when added)
- ✅ Sales site (when added)
- ✅ Garage site (when added)

## Password Security

### Current Setup (Development):
- Passwords stored as plain text
- Works for testing/development

### Production (Later):
- Passwords should be hashed (bcrypt, argon2)
- Never store plain text passwords
- Use secure password hashing

## Viewing User Passwords

**Note**: For security, passwords are not displayed in the dashboard. Only you (admin) know the password when creating the user.

## Resetting Passwords

Currently, you need to:
1. Update user in dashboard
2. Set new password
3. Sync to all sites

(Password reset feature can be added later)

## Quick Setup

1. **Run SQL**: `add-password-field.sql` in central Supabase
2. **Update HRMS table**: Add password_hash column to HRMS user_profiles
3. **Create user**: Use "Add User" form with password
4. **Sync user**: Click "Sync" to sync password to all sites
5. **Login**: User can now login to HRMS with email + password

## Example

**Creating user "peru":**
- Email: `peru@example.com`
- Password: `peru123` (set in dashboard)
- Password synced to HRMS
- User logs into HRMS with: `peru@example.com` / `peru123`

The password you set in the dashboard is the password they use to login everywhere!
