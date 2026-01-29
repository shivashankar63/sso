// Middleware that conditionally uses Clerk
// When Clerk isn't configured, it's a no-op to prevent initialization errors

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

// Check if Clerk is configured
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
const clerkSecretKey = process.env.CLERK_SECRET_KEY || "";

const isClerkConfigured = 
  clerkPublishableKey.length > 0 &&
  !clerkPublishableKey.includes("...") &&
  clerkPublishableKey.startsWith("pk_") &&
  clerkSecretKey.length > 0 &&
  !clerkSecretKey.includes("...") &&
  clerkSecretKey.startsWith("sk_");

// Default: no-op middleware when Clerk isn't configured
// This prevents the "Missing publishableKey" error
export default function middleware() {
  // When Clerk isn't configured, allow all requests through
  // The app layout will show the setup message instead
  return;
}

// NOTE: When you add your Clerk keys to .env.local, uncomment the code below
// and comment out the no-op middleware above to enable Clerk authentication

/*
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
*/
