# Complete Setup Guide for SSO Dashboard

This guide will walk you through setting up your centralized SSO system with Clerk and Supabase.

## Step 1: Set Up Clerk (Identity Hub)

### 1.1 Create Clerk Application

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up or log in
3. Click "Create Application"
4. Choose a name (e.g., "My Company SSO")
5. Select authentication methods (Email, Google, etc.)

### 1.2 Get Your Clerk Keys

1. In Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 1.3 Create JWT Template for Supabase

1. In Clerk Dashboard, go to **JWT Templates**
2. Click **New Template**
3. Name it: `supabase`
4. Choose **Supabase** as the template type (or use custom)
5. Add these claims:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "role": "authenticated"
   }
   ```
6. Copy the **Signing Key** (this is your JWT Secret)

## Step 2: Configure Supabase Projects

You need to configure **all 4 Supabase projects** (HRMS, CMS, Sales, Garage).

### 2.1 Update JWT Secret in Each Supabase Project

For each Supabase project:

1. Go to **Project Settings > API**
2. Scroll to **JWT Settings**
3. **IMPORTANT**: Replace the JWT Secret with the one from Clerk (the Signing Key you copied)
4. Click **Save**

⚠️ **Critical**: All 4 Supabase projects must use the **SAME JWT Secret** from Clerk.

### 2.2 Create Helper Function in Each Database

Run this SQL in the SQL Editor of **each** Supabase project:

```sql
-- Function to extract user ID from Clerk JWT token
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS text AS $$
SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;
```

### 2.3 Update Row-Level Security (RLS) Policies

For each table that needs user-specific access, update your RLS policies:

```sql
-- Example: Update existing policy to use Clerk user ID
DROP POLICY IF EXISTS "Users can see their own data" ON your_table;

CREATE POLICY "Users can see their own data" 
ON your_table 
FOR SELECT 
USING (get_user_id() = user_id::text);
```

Replace `your_table` and `user_id` with your actual table and column names.

## Step 3: Configure Environment Variables

### 3.1 Create `.env.local` File

Create a `.env.local` file in the root of your project:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase Configuration (use one of your 4 projects for the dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Clerk JWT Secret (same one you used in all Supabase projects)
CLERK_JWT_SECRET=your-jwt-secret-from-clerk
```

### 3.2 Get Supabase Credentials

For each Supabase project:

1. Go to **Project Settings > API**
2. Copy the **Project URL** (this is `NEXT_PUBLIC_SUPABASE_URL`)
3. Copy the **anon/public key** (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

For the dashboard, you can use any of your 4 Supabase projects.

## Step 4: Configure Authorized Redirect URIs

In Clerk Dashboard:

1. Go to **Settings > Paths**
2. Add these **Authorized Redirect URIs**:
   - `http://localhost:3000/api/auth/callback` (for local development)
   - `https://hrms.vercel.app/api/auth/callback`
   - `https://cms.vercel.app/api/auth/callback`
   - `https://sales-portal.vercel.app/api/auth/callback`
   - `https://garage.vercel.app/api/auth/callback`

## Step 5: Install and Run

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Run Development Server

```bash
npm run dev
```

### 5.3 Test the Setup

1. Open [http://localhost:3000](http://localhost:3000)
2. You should be redirected to sign-in
3. Sign up or sign in
4. You should see the dashboard

## Step 6: Connect Your Other Applications

For each of your 4 applications (HRMS, CMS, Sales, Garage):

### 6.1 Install Clerk

```bash
npm install @clerk/nextjs
```

### 6.2 Update Your App Layout

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
```

### 6.3 Update Supabase Client

Replace your Supabase client with one that uses Clerk JWT:

```tsx
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function createSupabaseClient() {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    }
  );
}
```

### 6.4 Add Middleware

Create `middleware.ts`:

```tsx
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```

## Troubleshooting

### Issue: "Invalid JWT" in Supabase

**Solution**: Make sure all Supabase projects use the same JWT Secret from Clerk.

### Issue: Users can't see their data

**Solution**: Check that:
1. The `get_user_id()` function exists in your database
2. Your RLS policies use `get_user_id()` correctly
3. The JWT token includes the `sub` claim with the user ID

### Issue: Redirect loop

**Solution**: Check that your redirect URIs in Clerk match your actual URLs exactly.

### Issue: "Token template not found"

**Solution**: Make sure you created a JWT template named "supabase" in Clerk.

## Next Steps

1. ✅ Test authentication flow
2. ✅ Verify users can access their data in Supabase
3. ✅ Set up roles and permissions in Clerk
4. ✅ Deploy to Vercel
5. ✅ Connect all 4 applications

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
