# Quick Start Guide

Get your SSO Dashboard up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Clerk account (free tier works)
- At least one Supabase project (free tier works)

## Step 1: Clone and Install

```bash
# Install dependencies
npm install
```

## Step 2: Set Up Clerk

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key**
4. Create a JWT Template named `supabase` (see CLERK_SETUP.md for details)
5. Copy the **Signing Key** from the template

## Step 3: Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
CLERK_JWT_SECRET=xxx
```

## Step 4: Configure Supabase

1. Go to Supabase Project Settings > API
2. Replace JWT Secret with Clerk's Signing Key
3. Run the SQL from `supabase-migration.sql` in the SQL Editor

## Step 5: Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## Next Steps

- Read `SETUP_GUIDE.md` for detailed instructions
- Read `CLERK_SETUP.md` for Clerk configuration
- Check `README.md` for architecture overview
