# Debug: User Not Appearing in HRMS

## Problem
- User created in SSO dashboard ✅
- User synced ✅
- But user not visible in HRMS database ❌
- Login shows "invalid credentials" ❌

## Possible Causes

### 1. User Not Actually Synced to HRMS
**Check:** Run in HRMS Supabase:
```sql
SELECT * FROM public.user_profiles WHERE email = 'your-email@example.com';
```

**If empty:**
- Sync didn't work
- Check sync API logs
- Verify HRMS Supabase credentials in dashboard

### 2. Password Not Set
**Check:**
```sql
SELECT email, password_hash, 
       CASE WHEN password_hash IS NULL THEN 'No password' ELSE 'Password set' END as status
FROM public.user_profiles 
WHERE email = 'your-email@example.com';
```

**If password_hash is NULL:**
- User was created without password
- Update user in dashboard → Add password → Sync again

### 3. HRMS Login Checking Wrong Table
**Issue:** HRMS login might be checking `employees` table instead of `user_profiles`

**Solution:** HRMS login should check `user_profiles` table for password

### 4. Sync API Error
**Check:** Browser console or server logs when clicking "Sync"

**Common errors:**
- "Site not found" → HRMS site not configured in dashboard
- "Supabase credentials not configured" → Need to add HRMS Supabase URL/key
- "Table does not exist" → Run `hrms-ensure-user-profiles.sql` in HRMS

## Quick Fix Steps

### Step 1: Verify User in Central Database
```sql
-- Run in CENTRAL Supabase
SELECT id, email, full_name, password_hash 
FROM public.user_profiles 
WHERE email = 'your-email@example.com';
```

### Step 2: Check HRMS Site Configuration
```sql
-- Run in CENTRAL Supabase
SELECT id, name, supabase_url, supabase_anon_key 
FROM public.connected_sites 
WHERE name = 'hrms';
```

**If supabase_url or supabase_anon_key is NULL:**
- Go to dashboard → Click DB icon next to HRMS → Add credentials

### Step 3: Verify User in HRMS
```sql
-- Run in HRMS Supabase
SELECT * FROM public.user_profiles WHERE email = 'your-email@example.com';
SELECT * FROM public.employees WHERE email = 'your-email@example.com';
```

### Step 4: Test Sync API Directly
```bash
# Replace with your actual values
curl -X POST http://localhost:3000/api/sync/user-to-site \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-from-central",
    "siteId": "hrms-site-id"
  }'
```

### Step 5: Check Sync Status
Visit: `http://localhost:3000/api/test/check-sync-status?email=your-email@example.com&siteId=hrms-site-id`

## Most Likely Issue

**Password not synced or user_profiles table missing in HRMS**

**Fix:**
1. Run `hrms-ensure-user-profiles.sql` in HRMS Supabase
2. Update user in dashboard → Add password
3. Click "Sync" again
4. Verify in HRMS: `SELECT * FROM user_profiles WHERE email = 'your-email';`

## HRMS Login Integration

HRMS login needs to check `user_profiles` table:

```javascript
// In HRMS login code
const { data: user } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('email', email)
  .single();

if (user && user.password_hash === password) {
  // Login successful
}
```
