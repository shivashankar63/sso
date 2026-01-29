# Sync User to HRMS - Step by Step

## Current Status

Your diagnostic shows:
- ❌ User NOT in HRMS `user_profiles`
- ❌ User NOT in HRMS `auth.users`
- ❌ User NOT in HRMS `employees`

**This means the user hasn't been synced to HRMS yet!**

## Step 1: Check User in Central Dashboard

Visit:
```
http://localhost:3000/api/test/check-central-user?email=your-email@example.com
```

**This will show:**
- ✅ If user exists in central dashboard
- ✅ If password is set
- ✅ If service key is configured
- ✅ Previous sync attempts

## Step 2: Verify Prerequisites

### A. User Must Exist in Central Dashboard

If user doesn't exist:
1. Go to dashboard
2. Click "Add User"
3. Fill in:
   - Email
   - **Password** (required!)
   - Full Name
   - Other details
4. Click "Add User"

### B. Password Must Be Set

If `has_password: false`:
1. Dashboard → Find user
2. Edit user
3. Set password
4. Save

### C. Service Key Must Be Set

If `has_service_key: false`:
1. Run `add-service-key-to-hrms.sql` in **Central Supabase**
2. Or: Dashboard → Connected Sites → HRMS → DB icon → Add service key

## Step 3: Sync User to HRMS

### Option A: From Dashboard UI

1. Go to dashboard
2. Find your user in the user list
3. Click **"Sync"** button next to the user
4. Select **HRMS** site
5. Click **"Sync to HRMS"**

### Option B: Via API

```bash
POST http://localhost:3000/api/sync/user
Body: {
  "userId": "user_id_from_dashboard"
}
```

## Step 4: Verify Sync Success

### Check Terminal Output

When you sync, you should see in the server terminal:
```
🔐 Creating auth.users entry for Supabase Auth login...
   Generated new UUID for auth user: xxx-xxx-xxx
✅ Auth user created - can now login with Supabase Auth!
   Auth User ID: xxx-xxx-xxx
✅ Employee record created in employees table
✅ User profile synced to HRMS
```

### Check Status Again

Visit:
```
http://localhost:3000/api/test/check-auth-users?email=your-email@example.com
```

**Should now show:**
- ✅ `user_profiles.exists: true`
- ✅ `auth_users.exists: true`
- ✅ `employees.exists: true`
- ✅ `can_login_with_auth: true`

## Step 5: Test Login

Now try logging into HRMS:
- Email: `your-email@example.com`
- Password: The password you set in dashboard

**Or test via API:**
```bash
POST http://localhost:3000/api/test/test-login
Body: {
  "email": "your-email@example.com",
  "password": "your-password"
}
```

## Troubleshooting

### If Sync Fails

**Check server terminal for errors:**
- `❌ Failed to create auth.users entry` → Service key issue
- `⚠️ Could not create employees entry` → RLS issue (run `fix-hrms-rls-simple.sql`)

### If User Still Not in HRMS After Sync

1. **Check service key:**
   ```sql
   -- Run in Central Supabase
   SELECT name, 
          CASE WHEN supabase_service_key IS NOT NULL THEN '✅' ELSE '❌' END 
   FROM connected_sites WHERE name = 'hrms';
   ```

2. **Re-sync user:**
   - Dashboard → Sync button
   - Check terminal for errors

3. **Check HRMS RLS:**
   - Run `fix-hrms-rls-simple.sql` in HRMS Supabase

## Quick Checklist

- [ ] User exists in central dashboard
- [ ] Password is set in central dashboard
- [ ] Service key is set for HRMS site
- [ ] User synced to HRMS (click Sync button)
- [ ] Terminal shows "Auth user created"
- [ ] Diagnostic shows `auth_users.exists: true`
- [ ] Login works in HRMS

Follow these steps and the user will be synced!
