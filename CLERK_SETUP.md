# Clerk JWT Template Setup for Supabase

This guide shows you exactly how to configure Clerk to work with Supabase.

## Step 1: Create JWT Template in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **JWT Templates** in the sidebar
4. Click **New Template**
5. Name it: `supabase` (exactly this name - case sensitive)

## Step 2: Configure the Template

### Option A: Use Supabase Template (Recommended)

1. In the template editor, select **Supabase** from the template dropdown
2. Clerk will automatically configure the correct claims
3. Click **Save**

### Option B: Custom Template

If Supabase template is not available, use these custom claims:

```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated",
  "aud": "authenticated",
  "iat": {{date.now}},
  "exp": {{date.now_plus_3600}}
}
```

**Important Claims:**
- `sub`: Must contain the user ID (this is what Supabase uses)
- `email`: User's email address
- `role`: Set to "authenticated"
- `aud`: Audience (usually "authenticated")
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Step 3: Get the Signing Key

1. After saving the template, you'll see a **Signing Key**
2. Copy this key - you'll need it for Supabase configuration
3. This is your `CLERK_JWT_SECRET` environment variable

## Step 4: Configure Supabase

1. Go to your Supabase project
2. Navigate to **Project Settings > API**
3. Scroll to **JWT Settings**
4. **Replace** the JWT Secret with the Signing Key from Clerk
5. Click **Save**

⚠️ **Critical**: All 4 Supabase projects must use the **SAME** Signing Key from Clerk.

## Step 5: Test the Integration

You can test if the JWT is working by:

1. Sign in to your application
2. Check the browser's Network tab
3. Look for requests to Supabase
4. The `Authorization` header should contain a Bearer token
5. Supabase should accept this token

## Troubleshooting

### "Invalid JWT" Error

- Make sure the JWT Secret in Supabase matches Clerk's Signing Key exactly
- Check that the `sub` claim contains the user ID
- Verify the token hasn't expired

### "Token template not found"

- Make sure the template is named exactly `supabase` (lowercase)
- Check that you're using the correct template name in your code: `getToken({ template: "supabase" })`

### Users Can't Access Data

- Verify the `get_user_id()` function exists in your database
- Check that RLS policies use `get_user_id()` correctly
- Ensure the `sub` claim matches your user ID column format

## Code Reference

In your application, use the template like this:

```typescript
// Server-side
const { getToken } = await auth();
const token = await getToken({ template: "supabase" });

// Client-side
const { getToken } = useAuth();
const token = await getToken({ template: "supabase" });
```

The token will automatically include all the claims you configured in the template.
