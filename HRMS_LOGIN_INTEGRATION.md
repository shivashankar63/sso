# HRMS Login Integration Guide

## Problem

User "peru" exists in database, but HRMS shows "Invalid login credentials" when trying to login.

## Why This Happens

The HRMS site has its own login system that doesn't know about the synced users yet. You need to integrate HRMS login with the SSO dashboard.

## Solution Options

### Option 1: Use SSO Dashboard API (Recommended)

HRMS site calls the SSO dashboard API to verify credentials.

**In your HRMS login code:**

```javascript
// HRMS Login Handler
async function handleLogin(email, password) {
  const response = await fetch('https://your-sso-dashboard.vercel.app/api/auth/verify-credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password,
      siteName: 'hrms' // Optional: verify user is synced to HRMS
    })
  });

  const result = await response.json();
  
  if (result.valid) {
    // Login successful!
    // Store user data in session/localStorage
    // Redirect to dashboard
    return result.user;
  } else {
    // Show error: result.error
    return null;
  }
}
```

### Option 2: Check HRMS Supabase Directly

HRMS checks its own Supabase database for user credentials.

**In your HRMS login code:**

```javascript
// HRMS Login Handler (using HRMS Supabase)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://snjtkvvmjqizdfyqbyzd.supabase.co', // HRMS Supabase URL
  'your-hrms-anon-key'
);

async function handleLogin(email, password) {
  // Find user in HRMS database
  const { data: user, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !user) {
    return { error: 'Invalid login credentials' };
  }

  // Verify password (plain text for now - hash in production!)
  if (user.password_hash !== password) {
    return { error: 'Invalid login credentials' };
  }

  // Login successful!
  return { user: user };
}
```

### Option 3: Verify User Exists in HRMS

First, check if user is actually synced to HRMS:

1. Go to [HRMS Supabase](https://supabase.com/dashboard/project/snjtkvvmjqizdfyqbyzd)
2. Open SQL Editor
3. Run:
   ```sql
   SELECT email, password_hash, full_name 
   FROM public.user_profiles 
   WHERE email = 'peru@example.com';
   ```

**If user doesn't exist:**
- User wasn't synced to HRMS yet
- Go to dashboard → Click "Sync" next to user
- Or click "Sync All" to sync all users

**If user exists but password is NULL:**
- Password wasn't synced
- Update user in dashboard with password
- Sync again

## Quick Fix Steps

### Step 1: Verify User is Synced

Run in HRMS Supabase:
```sql
SELECT * FROM public.user_profiles WHERE email = 'peru@example.com';
```

### Step 2: Check Password

If user exists, check if password_hash is set:
```sql
SELECT email, password_hash, 
       CASE WHEN password_hash IS NULL THEN 'No password' ELSE 'Password set' END as status
FROM public.user_profiles 
WHERE email = 'peru@example.com';
```

### Step 3: If Password is Missing

1. Go to dashboard
2. Find user "peru"
3. Update user (add password if missing)
4. Click "Sync" to sync password to HRMS

### Step 4: Update HRMS Login Code

Use one of the options above to verify credentials against:
- SSO Dashboard API (Option 1)
- HRMS Supabase directly (Option 2)

## Testing

After updating HRMS login:

1. Try logging in with:
   - Email: `peru@example.com` (or whatever email you used)
   - Password: The password you set in dashboard

2. Should login successfully!

## Current Status

✅ User created in dashboard
✅ Password field added
✅ Sync API created
❌ HRMS login not integrated yet

**Next:** Update HRMS login code to use synced user data!
