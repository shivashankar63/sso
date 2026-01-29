# How to Create a User in Dashboard

## Step 1: Open Your Dashboard

Go to: `http://localhost:3000`

## Step 2: Find "User Management" Section

Scroll down on the dashboard page. You'll see a section called **"User Management"** with:
- A list of existing users (if any)
- An **"Add User"** button

## Step 3: Click "Add User" Button

Click the **"Add User"** button to open the form.

## Step 4: Fill in the Form

Fill in these fields:

### Required Fields:
- **Email** * (e.g., `peru@example.com`)
- **Password** * (e.g., `password123`) - This will be used to login to HRMS!

### Optional Fields:
- **Full Name** (e.g., `Peru User`)
- **Role** (default: `user`)
- **Team** (optional)
- **Department** (optional)

## Step 5: Click "Add User"

After filling the form, click **"Add User"** button.

You should see:
- ✅ Alert: "User added successfully! Sync to sites to propagate the user."
- User appears in the list below

## Step 6: Sync User to HRMS

After creating the user:

1. Find the user in the list
2. Click the **"Sync"** button (next to the user)
3. Select **HRMS** site
4. Click **"Sync to HRMS"**

Watch the server terminal - you should see:
```
🔐 Creating auth.users entry...
✅ Auth user created - can now login with Supabase Auth!
✅ Employee record created
✅ User profile synced to HRMS
```

## Step 7: Verify User Was Created

Check if user exists:
```
http://localhost:3000/api/test/check-central-user?email=your-email@example.com
```

Should show:
- ✅ `exists: true`
- ✅ `has_password: true`

## Step 8: Verify User Synced to HRMS

Check HRMS sync:
```
http://localhost:3000/api/test/check-auth-users?email=your-email@example.com
```

Should show:
- ✅ `auth_users.exists: true`
- ✅ `user_profiles.exists: true`
- ✅ `can_login_with_auth: true`

## Step 9: Test Login in HRMS

Now try logging into HRMS:
- **Email**: The email you entered
- **Password**: The password you entered

## Troubleshooting

### If "Add User" button doesn't appear:
- Make sure you're on the dashboard page (`http://localhost:3000`)
- Scroll down to find "User Management" section
- Check browser console for errors

### If user creation fails:
- Check server terminal for errors
- Verify `user_profiles` table exists in Central Supabase
- Check RLS policies allow inserts

### If sync fails:
- Make sure service key is set for HRMS
- Check server terminal for sync errors
- Verify HRMS Supabase credentials are correct

## Quick Checklist

- [ ] Dashboard page loads (`http://localhost:3000`)
- [ ] "User Management" section visible
- [ ] "Add User" button works
- [ ] Form accepts email and password
- [ ] User created successfully
- [ ] User appears in list
- [ ] Sync button works
- [ ] User synced to HRMS
- [ ] Login works in HRMS

## Visual Guide

```
Dashboard Page
├── Stats Cards (top)
├── Connected Applications
├── Connected Sites Manager
├── User Management ← FIND THIS SECTION
│   ├── [Add User] button ← CLICK THIS
│   ├── User List
│   │   └── [Sync] button ← CLICK THIS AFTER CREATING
└── User Sync Manager
```

The UserManager component is already on your dashboard - just scroll down to find it!
