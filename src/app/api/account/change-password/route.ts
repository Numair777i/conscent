import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { rateLimit } from "@/lib/rate-limit";
import { validateNewPassword } from "@/lib/password-rules";
import {
  describeRequest,
  sendPasswordChangedEmail,
} from "@/lib/account-emails";

export const dynamic = "force-dynamic";

type Field = "currentPassword" | "newPassword" | "confirmPassword";

function fail(error: string, status: number, field?: Field) {
  return NextResponse.json({ success: false, error, field }, { status });
}

export async function POST(req: Request) {
  try {
    // 1. Must be signed in. The user comes from the session, never from the request body.
    const session = await auth();
    const userId = session?.user?.id;
    const email = session?.user?.email?.toLowerCase().trim();

    if (!userId && !email) {
      return fail("Please sign in to change your password.", 401);
    }

    // 2. Slow down guessing of the current password (per user)
    const limited = rateLimit(
      `change-password:${userId || email}`,
      5,
      15 * 60 * 1000,
    );
    if (!limited.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many attempts. Please try again in a few minutes.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    // 3. Read and check the input
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return fail("Invalid request.", 400);
    }

    const { currentPassword, newPassword, confirmPassword } = body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return fail("Please fill in all fields.", 400);
    }

    if (newPassword !== confirmPassword) {
      return fail("New passwords do not match.", 400, "confirmPassword");
    }

    const ruleError = validateNewPassword(newPassword);
    if (ruleError) {
      return fail(ruleError, 400, "newPassword");
    }

    // 4. Load the user record
    const client = await clientPromise;
    const users = client.db().collection("users");

    const filter =
      userId && ObjectId.isValid(userId)
        ? { _id: new ObjectId(userId) }
        : { email: email as string };

    const user = await users.findOne(filter);

    if (!user) {
      return fail("Account not found.", 404);
    }

    // Google-only accounts have no password to change
    if (!user.password || typeof user.password !== "string") {
      return fail(
        "This account signs in with Google, so it has no password to change.",
        400,
      );
    }

    // 5. Check the current password against the stored hash
    const currentIsValid = await bcrypt.compare(currentPassword, user.password);
    if (!currentIsValid) {
      // 400 (not 401) on purpose: the user is still signed in, they just typed it wrong
      return fail("Current password is incorrect.", 400, "currentPassword");
    }

    // 6. New password must be different (the current one is already verified)
    if (newPassword === currentPassword) {
      return fail(
        "New password must be different from your current password.",
        400,
        "newPassword",
      );
    }

    // 7. Hash and save. The filter includes the old hash, so if the password
    // changed in the meantime (two tabs), nothing is overwritten.
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const result = await users.updateOne(
      { _id: user._id, password: user.password },
      {
        $set: { password: hashedPassword, updatedAt: new Date() },
        // Any pending "forgot password" link stops working
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
      },
    );

    if (result.modifiedCount !== 1) {
      return fail(
        "Your password changed in another session. Please try again.",
        409,
      );
    }

    // 8. Security alert email. A failed email must not undo the password change.
    const recipient =
      typeof user.email === "string" && user.email ? user.email : email;
    if (recipient) {
      await sendPasswordChangedEmail({
        to: recipient,
        name: typeof user.name === "string" ? user.name : null,
        changedAt: new Date(),
        context: describeRequest(req),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been updated.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}
