# Fix HRMS Login - Use user_profiles Table

## Problem

HRMS login uses `supabase.auth.signInWithPassword()` which checks `auth.users` table, but we're syncing users to `user_profiles` table. They're different tables!

## Solution: Custom Login Handler

Replace Supabase Auth login with custom login that checks `user_profiles` table.

---

## Updated AuthContext.tsx

Replace the `signIn` function in `src/contexts/AuthContext.tsx`:

```typescript
const signIn = async (email: string, password: string) => {
  try {
    // Check user_profiles table instead of auth.users
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (userError || !user) {
      return { 
        error: new Error("Invalid email or password") 
      };
    }

    // Verify password (plain text comparison for now)
    // TODO: Use bcrypt in production!
    if (!user.password_hash || user.password_hash !== password) {
      return { 
        error: new Error("Invalid email or password") 
      };
    }

    // Login successful! Create a mock user object for Supabase Auth compatibility
    // This allows the rest of the app to work without changes
    const mockUser: User = {
      id: user.id,
      email: user.email,
      app_metadata: {},
      user_metadata: {
        full_name: user.full_name,
        role: user.role,
      },
      aud: "authenticated",
      created_at: user.created_at || new Date().toISOString(),
    } as User;

    // Set user in state (bypass Supabase Auth)
    setUser(mockUser);
    
    // Store session in localStorage manually
    const session = {
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`,
      expires_at: Date.now() + 3600000, // 1 hour
      user: mockUser,
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));

    return { error: null };
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      error: error instanceof Error ? error : new Error("Login failed") 
    };
  }
};
```

---

## Alternative: Simpler Approach (Recommended)

Keep using Supabase Auth but create users in `auth.users` when syncing:

### Update Sync API to Create auth.users

We need to update the sync to also create users in `auth.users` table using Supabase Admin API.

---

## Quick Fix: Update Sync to Create auth.users

The sync should create users in BOTH:
1. `user_profiles` table (for data storage) ✅ Already doing this
2. `auth.users` table (for Supabase Auth login) ❌ Missing

Let me update the sync API to create auth.users entries.
