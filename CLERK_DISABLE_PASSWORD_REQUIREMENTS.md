# How to Disable Password Requirements in Clerk

The password breach detection error can be disabled in the Clerk Dashboard. Follow these steps:

## Step 1: Disable Breach Detection in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **User & Authentication** in the sidebar
4. Click on **Password** (under Authentication)
5. Find the setting: **"Check passwords against breach database"**
6. **Toggle it OFF** (disable it)
7. Click **Save**

## Step 2: Disable Password Complexity Requirements (Optional)

While you're in the Password settings:

1. **Minimum length**: Set to 1 (or your preferred minimum)
2. **Require uppercase letters**: Toggle OFF
3. **Require lowercase letters**: Toggle OFF  
4. **Require numbers**: Toggle OFF
5. **Require special characters**: Toggle OFF
6. Click **Save**

## Step 3: Restart Your Application

After making these changes:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try signing up again with a simple password

## Alternative: Use Environment Variables (Advanced)

If you have access to Clerk's API, you can also configure this programmatically, but the Dashboard method is the easiest and most reliable.

## Verification

After disabling breach detection:
- ✅ Simple passwords like "password123" should work
- ✅ No more "password found in breach" errors
- ✅ Users can use any password they want

## Security Warning

⚠️ **Important**: Disabling password requirements reduces security:
- Consider using this only for development/testing
- For production, consider:
  - Keeping minimum length requirements
  - Implementing 2FA (Two-Factor Authentication)
  - Using rate limiting to prevent brute force attacks
  - Monitoring for suspicious login attempts

## Current Configuration

The sign-up page in `app/sign-up/[[...sign-up]]/page.tsx` is ready to work with your Dashboard settings. Once you disable breach detection in the Dashboard, the error will no longer appear.
