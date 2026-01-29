# New Supabase Database Configuration

Your Supabase database has been updated with new credentials.

## New Database Credentials

- **Project URL**: `https://snvyotfofpdkheecupho.supabase.co`
- **API Key**: `sb_publishable_R3mqqUsV5DVFuPXUt0Izcg_aUKJ-aNL`

## Configuration Status

✅ **Updated Files:**
- `.env.local` - Environment variables
- `env.local.setup` - Template file
- `README.md` - Documentation
- `SUPABASE_CONFIG.md` - Configuration guide

✅ **Supabase Client:**
- `lib/supabase.ts` - Automatically uses new credentials from environment variables

## Next Steps

### 1. Restart Development Server

The new credentials are in `.env.local`, but you need to restart the server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Run Database Migrations

Since this is a new database, you need to set it up:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/snvyotfofpdkheecupho

2. **Run the base migration** (creates `get_user_id()` function):
   - Go to **SQL Editor**
   - Run the SQL from `supabase-migration.sql`

3. **Run the schema migration** (creates tables):
   - Run the SQL from `supabase-clerk-schema.sql`

### 3. Configure JWT Secret (When Clerk is Set Up)

Once you have Clerk configured:

1. Go to **Project Settings > API** in Supabase
2. Update the **JWT Secret** to match Clerk's JWT Secret
3. This allows Supabase to trust tokens from Clerk

### 4. Test the Connection

After restarting the server, the app will automatically use the new Supabase database.

## Database URL

Access your Supabase project:
- Dashboard: https://supabase.com/dashboard/project/snvyotfofpdkheecupho
- API URL: https://snvyotfofpdkheecupho.supabase.co

## Important Notes

- The Supabase client in `lib/supabase.ts` automatically reads from environment variables
- No code changes needed - just restart the server
- Make sure to run the migrations before using the database
- When you set up Clerk, remember to update the JWT Secret in Supabase
