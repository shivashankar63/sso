// Helper to conditionally create Clerk middleware
// This prevents Clerk from initializing when keys are missing

export function createMiddleware() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const clerkSecretKey = process.env.CLERK_SECRET_KEY || "";

  const isClerkConfigured = 
    clerkPublishableKey.length > 0 &&
    !clerkPublishableKey.includes("...") &&
    clerkPublishableKey.startsWith("pk_") &&
    clerkSecretKey.length > 0 &&
    !clerkSecretKey.includes("...") &&
    clerkSecretKey.startsWith("sk_");

  if (!isClerkConfigured) {
    // Return no-op middleware
    return function middleware() {
      return;
    };
  }

  // Clerk is configured - import and use it
  // This will be handled by the actual middleware.ts file
  return null;
}
