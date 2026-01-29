# SSO Dashboard - Centralized Identity Hub

A modern Single Sign-On (SSO) dashboard built with Next.js, Clerk, and Supabase. This application serves as a centralized identity hub that manages authentication across multiple applications (HRMS, CMS, Sales Portal, Garage).

## 🚀 Quick Deploy to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

**Quick steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Architecture

This project implements a **corporate SSO architecture** where:

- **Clerk** acts as the central Identity Hub
- **Supabase** databases (one per application) trust Clerk's JWT tokens
- All 4 sites (HRMS, CMS, Sales, Garage) redirect to a single login page
- Once authenticated, users get a JWT token that works across all databases

## Features

- 🔐 Centralized authentication with Clerk
- 📊 Dashboard with user statistics and connected applications
- 👥 User management and role-based access
- 🛡️ Access policy management
- 🔄 Real-time sync status for connected apps
- 🎨 Modern, responsive UI with Tailwind CSS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Clerk (Identity Hub)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) and create a new application
2. Note down your **Publishable Key** and **Secret Key**
3. Go to **Settings > JWT Templates** and create a new template called "supabase"
4. Copy the **JWT Secret** from Clerk

### 3. Configure Supabase

For each of your 4 Supabase projects (HRMS, CMS, Sales, Garage):

1. Go to **Project Settings > API**
2. **IMPORTANT**: Change the JWT Secret to match Clerk's JWT Secret
3. This tells Supabase to trust tokens from Clerk

4. Run this SQL in the SQL Editor of all 4 databases:

```sql
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS text AS $$
SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;
```

5. Update your RLS policies to use this function:

```sql
CREATE POLICY "Users can see their own data" 
ON my_table 
FOR SELECT 
USING (auth.uid()::text = get_user_id());
```

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase Configuration
# Use the SAME JWT Secret from Clerk in all 4 Supabase projects
NEXT_PUBLIC_SUPABASE_URL=https://snvyotfofpdkheecupho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_R3mqqUsV5DVFuPXUt0Izcg_aUKJ-aNL

# Clerk JWT Secret (for Supabase integration)
CLERK_JWT_SECRET=your-clerk-jwt-secret
```

### 5. Configure Authorized Redirect URIs

In Clerk Dashboard, add all 4 site URLs as Authorized Redirect URIs:

- `https://hrms.vercel.app/api/auth/callback`
- `https://cms.vercel.app/api/auth/callback`
- `https://sales-portal.vercel.app/api/auth/callback`
- `https://garage.vercel.app/api/auth/callback`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with ClerkProvider
│   ├── page.tsx             # Main dashboard page
│   ├── globals.css          # Global styles
│   ├── sign-in/             # Sign-in page
│   └── sign-up/             # Sign-up page
├── components/
│   ├── dashboard/           # Dashboard components
│   ├── layout/              # Layout components
│   └── ui/                  # UI primitives
├── lib/
│   ├── supabase.ts          # Supabase client with Clerk JWT
│   └── utils.ts             # Utility functions
└── middleware.ts            # Route protection middleware
```

## Key Implementation Details

### Supabase Client with Clerk JWT

The `lib/supabase.ts` file creates a Supabase client that automatically includes Clerk's JWT token in all requests. This allows Supabase to authenticate users based on Clerk's tokens.

### Route Protection

The `middleware.ts` file protects all routes except public ones (sign-in, sign-up, webhooks).

### Multi-Site Support

To use this SSO system across multiple sites:

1. Each site keeps its own Supabase database
2. All sites use the same Clerk application
3. All Supabase projects use the same JWT Secret (from Clerk)
4. Users authenticate once and can access all sites

## Benefits

✅ **One Dashboard**: Manage all interns/users from one place  
✅ **Cross-App Roles**: Assign roles in Clerk, apply to all sites  
✅ **No Master DB**: Each site keeps private data, identity is unified  
✅ **Scalable**: Easy to add more sites (just add redirect URI)  
✅ **Secure**: Centralized security policies and MFA

## Next Steps

1. Connect your 4 applications to use Clerk authentication
2. Update each app's Supabase client to use Clerk JWT
3. Configure RLS policies in each Supabase project
4. Test the SSO flow across all applications

## Support

For issues or questions, refer to:
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
