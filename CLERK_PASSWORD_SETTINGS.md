# Clerk Password Settings - Simple Passwords Enabled

Password complexity requirements have been disabled to allow simple passwords.

## What Was Changed

The sign-up page has been updated to:
- ✅ Disable password breach detection
- ✅ Remove minimum length requirements (set to 1)
- ✅ Remove uppercase requirement
- ✅ Remove lowercase requirement
- ✅ Remove numbers requirement
- ✅ Remove special characters requirement

## Configuration

The password settings are configured in `app/sign-up/[[...sign-up]]/page.tsx`:

```tsx
<SignUp 
  passwordSettings={{
    minLength: 1,
    maxLength: 1000,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialCharacters: false,
    disableBreachDetection: true, // Disables "password found in breach" check
  }}
/>
```

## Additional Clerk Dashboard Settings

You can also configure this in the Clerk Dashboard:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **User & Authentication > Password**
3. Disable the following:
   - ✅ "Check passwords against breach database" (disable this)
   - ✅ "Require uppercase letters" (disable)
   - ✅ "Require lowercase letters" (disable)
   - ✅ "Require numbers" (disable)
   - ✅ "Require special characters" (disable)
4. Set "Minimum length" to 1 (or your preferred minimum)

## Security Note

⚠️ **Warning**: Allowing simple passwords reduces security. Consider:
- Using this only for development/testing
- Implementing additional security measures (2FA, rate limiting)
- For production, consider keeping some password requirements

## Testing

After these changes:
1. Restart your dev server
2. Try signing up with a simple password (e.g., "password123" or "test")
3. The breach detection error should no longer appear
