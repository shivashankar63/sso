import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUserProfile } from "@/lib/supabase-helpers";

/**
 * API route to sync Clerk user with Supabase profile
 * Call this after user signs in to ensure profile exists
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data from Clerk
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create profile in Supabase
    const profile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || "",
      user.fullName || undefined
    );

    if (!profile) {
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("Error syncing profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
