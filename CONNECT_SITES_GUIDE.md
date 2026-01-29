# Guide: Connecting Your Websites

This guide explains how to connect multiple websites to your SSO Dashboard.

## Step 1: Set Up Database Schema

First, run the connected sites schema in your Supabase database:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/snvyotfofpdkheecupho)
2. Open **SQL Editor**
3. Copy and paste the contents of `connected-sites-schema.sql`
4. Click **Run**

This creates the `connected_sites` table to store your website configurations.

## Step 2: Add Your Sites via Dashboard

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Open the dashboard**: http://localhost:3000

3. **Scroll to "Connected Applications"** section

4. **Click "Add Site"** button

5. **Fill in the form**:
   - **Site Name**: Unique identifier (e.g., `hrms`, `cms`, `sales`)
   - **Display Name**: Friendly name (e.g., "HRMS System", "CMS Portal")
   - **URL**: Full URL of your website (e.g., `https://hrms.example.com`)
   - **Icon**: Emoji or icon (e.g., `💼`, `📝`, `💰`)
   - **Category**: Optional category tag
   - **Description**: Optional description

6. **Click "Add Site"**

## Step 3: Connect Your Websites

### Option A: OAuth 2.0 (Recommended)

For each website you want to connect:

1. **In your website's code**, add OAuth redirect:
   ```javascript
   // Redirect to SSO Dashboard for authentication
   const ssoUrl = 'https://your-dashboard.vercel.app/api/auth/oauth';
   window.location.href = `${ssoUrl}?redirect=${encodeURIComponent(window.location.href)}`;
   ```

2. **In the dashboard**, configure OAuth settings:
   - Go to site settings
   - Add Client ID and Client Secret
   - Set redirect URI

### Option B: Simple Link (For Now)

Since authentication is disabled, you can:

1. **Add your sites** using the dashboard form
2. **They'll be stored** in the database
3. **When you enable authentication**, configure OAuth/SAML

## Current Setup

- ✅ **Database schema** ready
- ✅ **UI to add sites** available
- ✅ **Sites stored** in Supabase
- ⏳ **OAuth integration** - configure when authentication is enabled

## Database Structure

Each connected site stores:
- Basic info (name, URL, icon)
- Status (active, pending, inactive, error)
- Protocol (OAuth, SAML, OIDC)
- User statistics
- Configuration settings

## Next Steps

1. ✅ Run the database schema
2. ✅ Add your 2 current sites via the dashboard
3. ⏳ Add more sites as needed (up to 4 or more)
4. ⏳ Configure OAuth when ready to enable authentication
5. ⏳ Test the connections

## API Endpoints (Future)

When authentication is enabled, you'll have:
- `POST /api/sites` - Add a new site
- `GET /api/sites` - List all sites
- `PUT /api/sites/:id` - Update site configuration
- `DELETE /api/sites/:id` - Remove a site
- `POST /api/sites/:id/sync` - Sync users from site

## Troubleshooting

**Sites not showing?**
- Check if you ran the database schema
- Verify the site was added successfully
- Check browser console for errors

**Can't add site?**
- Make sure Supabase is configured correctly
- Check `.env.local` has Supabase credentials
- Verify database connection

## Support

The connected sites are stored in Supabase and can be managed through the dashboard UI. When you're ready to enable authentication, we'll configure the OAuth/SAML integration for each site.
