# Enable Clerk SSO - Step by Step

## Why Enable Clerk Now?

Currently:
- ❌ Users need passwords for each site
- ❌ No single sign-on
- ❌ User "peru" can't login to HRMS without password

With Clerk SSO:
- ✅ User logs in once (to dashboard)
- ✅ Gets JWT token
- ✅ All sites accept the token
- ✅ No passwords needed per site!

## Step 1: Get Clerk Credentials

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create account or login
3. Create a new application
4. Get your keys:
   - **Publishable Key**: `pk_test_...` or `pk_live_...`
   - **Secret Key**: `sk_test_...` or `sk_live_...`

## Step 2: Add to .env.local

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
```

## Step 3: Configure JWT Template in Clerk

1. Go to Clerk Dashboard → JWT Templates
2. Create new template named "supabase"
3. Add claims:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}"
   }
   ```

## Step 4: Update Supabase JWT Secret

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Project Settings → API
3. Get JWT Secret from Clerk
4. Update Supabase JWT Secret to match Clerk's

## Step 5: Re-enable Authentication

I can help you re-enable authentication in the code once you have Clerk keys.

## Step 6: Update Each Site

Each site (HRMS, CMS, etc.) needs to:
- Accept Clerk JWT tokens
- Verify tokens match Clerk's secret
- Auto-login users with valid tokens

## Benefits

✅ **One Login**: User logs in once to dashboard
✅ **Access All Sites**: Token works everywhere
✅ **No Passwords**: No need to set passwords per site
✅ **Secure**: JWT tokens are cryptographically signed
✅ **Scalable**: Add unlimited sites easily

## Alternative: Quick Password Solution

If you want to keep authentication disabled for now, I can create:
- Password field in user management
- Password sync to all sites
- Simple password-based login

But SSO with Clerk is the better long-term solution!
