import { SignUp } from "@clerk/nextjs";

const isClerkConfigured = 
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 0 &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_...";

export default function SignUpPage() {
  if (!isClerkConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Clerk Not Configured
          </h1>
          <p className="text-muted-foreground">
            Please configure Clerk authentication to use this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
          },
        }}
        unsafeMetadata={{}}
        // Password settings are configured in Clerk Dashboard
        // Go to: User & Authentication > Password
        // Disable: "Check passwords against breach database"
      />
    </div>
  );
}
