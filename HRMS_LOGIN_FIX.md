# Fix HRMS Login - Use Synced User Data

## Problem
Users are synced to HRMS database, but login is not working.

## Root Cause
HRMS login code is probably:
- Not checking `user_profiles` table
- Using wrong authentication method
- Not comparing password correctly

## Solution: Update HRMS Login Code

### Option 1: Check user_profiles Table (Recommended)

**In your HRMS login handler:**

```javascript
import { createClient } from '@supabase/supabase-js';

// HRMS Supabase client
const hrmsSupabase = createClient(
  'https://snjtkvvmjqizdfyqbyzd.supabase.co',
  'your-hrms-anon-key'
);

async function handleLogin(email, password) {
  // Find user in user_profiles table (synced from SSO dashboard)
  const { data: user, error } = await hrmsSupabase
    .from('user_profiles')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !user) {
    return { error: 'Invalid email or password' };
  }

  // Verify password (plain text comparison for now)
  // TODO: Use bcrypt in production!
  if (user.password_hash !== password) {
    return { error: 'Invalid email or password' };
  }

  // Login successful!
  // Store user in session/localStorage
  // Redirect to dashboard
  
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    }
  };
}
```

### Option 2: Use SSO Dashboard API

**In your HRMS login handler:**

```javascript
async function handleLogin(email, password) {
  // Call SSO dashboard API to verify credentials
  const response = await fetch('https://your-sso-dashboard.vercel.app/api/auth/verify-credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password,
      siteName: 'hrms'
    })
  });

  const result = await response.json();

  if (result.valid) {
    // Login successful!
    return {
      success: true,
      user: result.user
    };
  } else {
    return { error: result.error || 'Invalid credentials' };
  }
}
```

## Quick Test

### Test 1: Verify User Exists in HRMS

Run in **HRMS Supabase**:
```sql
SELECT email, password_hash, full_name
FROM public.user_profiles
WHERE email = 'your-email@example.com';
```

**If user exists:**
- Check if `password_hash` matches the password you're using
- Verify email is exact match (case-sensitive)

### Test 2: Test Password Comparison

```javascript
// Test in browser console or HRMS code
const userPassword = 'your-password'; // Password from dashboard
const dbPassword = 'password-from-db'; // password_hash from user_profiles

console.log('Match:', userPassword === dbPassword);
```

## Common Issues

### Issue 1: Password Not Matching
**Symptom:** User exists but login fails
**Fix:** 
- Verify password in dashboard matches what you're typing
- Check if password_hash is stored correctly
- Make sure no extra spaces/characters

### Issue 2: Email Case Sensitivity
**Symptom:** User not found
**Fix:**
```javascript
// Always lowercase email
.eq('email', email.toLowerCase().trim())
```

### Issue 3: Wrong Table
**Symptom:** User not found
**Fix:** Make sure checking `user_profiles` table, not `employees` or `users`

### Issue 4: Password Hash Format
**Symptom:** Password doesn't match
**Fix:** 
- Currently using plain text (password_hash === password)
- In production, use bcrypt: `bcrypt.compare(password, user.password_hash)`

## Implementation Checklist

- [ ] HRMS login checks `user_profiles` table
- [ ] Email is lowercased and trimmed
- [ ] Password comparison works (plain text for now)
- [ ] Error messages are clear
- [ ] Session is set after successful login

## Next Steps

1. **Update HRMS login code** to check `user_profiles` table
2. **Test login** with synced user credentials
3. **Verify password comparison** works correctly
4. **Set up session** after successful login

The users are synced - now just need to update HRMS login to use them!
