# Supabase Configuration

Your Supabase credentials have been integrated into the project.

## Your Supabase Credentials

- **Project URL**: `https://snvyotfofpdkheecupho.supabase.co`
- **API Key**: `sb_publishable_R3mqqUsV5DVFuPXUt0Izcg_aUKJ-aNL`

## Setup Steps

### 1. Create `.env.local` File

Create a `.env.local` file in the root directory with these values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://snvyotfofpdkheecupho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_R3mqqUsV5DVFuPXUt0Izcg_aUKJ-aNL

# Clerk Authentication (Add your Clerk keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Clerk JWT Secret
CLERK_JWT_SECRET=your-clerk-jwt-secret
```

### 2. Configure Supabase JWT Secret

**IMPORTANT**: For SSO to work, you need to:

1. Go to your Supabase project: https://supabase.com/dashboard/project/ostdxmquaeiqntyhazxc
2. Navigate to **Project Settings > API**
3. Scroll to **JWT Settings**
4. Replace the JWT Secret with the one from Clerk (after you set up Clerk)
5. This allows Supabase to trust tokens from Clerk

### 3. Run Database Migration

Run the SQL from `supabase-migration.sql` in your Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Paste the contents of `supabase-migration.sql`
4. Run the query

This creates the `get_user_id()` function needed for RLS policies.

### 4. Test the Connection

After setting up Clerk, you can test the Supabase connection:

```bash
npm run dev
```

The Supabase client is automatically configured in `lib/supabase.ts` and will use your credentials.

## Files Using Supabase

- `lib/supabase.ts` - Server-side Supabase client with Clerk JWT
- `lib/supabase-client.ts` - Client-side Supabase hook
- `app/api/example/route.ts` - Example API route using Supabase

## Next Steps

1. ✅ Supabase credentials configured
2. ⏳ Set up Clerk authentication
3. ⏳ Update Supabase JWT Secret to match Clerk
4. ⏳ Run database migration
5. ⏳ Test the integration
