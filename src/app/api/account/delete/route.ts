import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { isAdminEmail } from "@/lib/admin";
import { rateLimit } from "@/lib/rate-limit";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { sendAccountDeletedEmail } from "@/lib/account-emails";

export const dynamic = "force-dynamic";

/* ==========================================================================
   Types
   ========================================================================== */

interface UserDoc {
  _id: ObjectId;
  email?: string;
  name?: string;
  password?: string;
}

interface DeleteBody {
  password?: unknown;
  confirmText?: unknown;
}

interface ApiResult {
  success: boolean;
  message?: string;
  error?: string;
  field?: "password" | "confirmText";
}

// Orders in these states are finished. Their contact details are masked
// (name, address, items and amounts stay for tax and invoicing records).
// Orders still in progress keep contact details so they can be delivered.
const FINISHED_STATUSES = ["DELIVERED", "CANCELLED", "RTO"];
const MASKED_EMAIL = "deleted-account@anonymized.invalid";
const MASKED_PHONE = "0000000000";

function respond(body: ApiResult, status: number): NextResponse {
  return NextResponse.json(body, { status });
}

/* ==========================================================================
   DELETE /api/account/delete
   ========================================================================== */

export async function DELETE(req: Request) {
  try {
    // 1. Must be signed in
    const session = await auth();
    const sessionUserId = session?.user?.id;
    const sessionEmail = session?.user?.email?.toLowerCase().trim();

    if (!sessionUserId && !sessionEmail) {
      return respond(
        { success: false, error: "Please sign in to delete your account." },
        401,
      );
    }

    // 2. Slow down password guessing (per user)
    const limited = rateLimit(
      `delete-account:${sessionUserId || sessionEmail}`,
      5,
      15 * 60 * 1000,
    );
    if (!limited.ok) {
      const res = NextResponse.json(
        {
          success: false,
          error: "Too many attempts. Please try again in a few minutes.",
        } satisfies ApiResult,
        { status: 429 },
      );
      res.headers.set("Retry-After", String(limited.retryAfterSec));
      return res;
    }

    // 3. Read the input
    let body: DeleteBody;
    try {
      body = (await req.json()) as DeleteBody;
    } catch {
      return respond({ success: false, error: "Invalid request." }, 400);
    }

    const confirmText =
      typeof body.confirmText === "string" ? body.confirmText.trim() : "";
    if (confirmText !== "DELETE") {
      return respond(
        {
          success: false,
          error: 'Type "DELETE" to confirm.',
          field: "confirmText",
        },
        400,
      );
    }

    // 4. Load the user
    const client = await clientPromise;
    const db = client.db();
    const users = db.collection<UserDoc>("users");

    let user: UserDoc | null = null;
    if (sessionUserId && ObjectId.isValid(sessionUserId)) {
      user = await users.findOne({ _id: new ObjectId(sessionUserId) });
    } else if (sessionEmail) {
      user = await users.findOne({ email: sessionEmail });
    }

    if (!user) {
      // The account is already gone: just end this stale session
      const res = NextResponse.json(
        {
          success: false,
          error: "Account not found. You have been signed out.",
        } satisfies ApiResult,
        { status: 404 },
      );
      clearAuthCookies(req, res);
      return res;
    }

    const userEmail = (user.email ?? sessionEmail ?? "").toLowerCase().trim();

    // The store admin must not lock the shop out by deleting this account
    if (isAdminEmail(userEmail)) {
      return respond(
        { success: false, error: "The admin account cannot be deleted." },
        403,
      );
    }

    // 5. Confirm identity with the password (Google-only accounts have none)
    if (typeof user.password === "string" && user.password) {
      const password = typeof body.password === "string" ? body.password : "";
      if (!password) {
        return respond(
          {
            success: false,
            error: "Enter your password to confirm.",
            field: "password",
          },
          400,
        );
      }

      const passwordIsValid = await bcrypt.compare(password, user.password);
      if (!passwordIsValid) {
        return respond(
          {
            success: false,
            error: "Password is incorrect.",
            field: "password",
          },
          400,
        );
      }
    }

    // 6. Database cleanup. The user record is removed LAST, so if anything
    // fails halfway the user can simply try again (every step is repeatable).
    const idString = user._id.toString();
    const idMatches = [user._id, idString];

    // 6a. Orders are kept, but finished ones lose their contact details...
    if (userEmail) {
      await db.collection("orders").updateMany(
        {
          shippingStatus: { $in: FINISHED_STATUSES },
          $or: [
            { userId: idString },
            { userEmail },
            { "customer.email": userEmail },
          ],
        },
        {
          $set: {
            "customer.email": MASKED_EMAIL,
            "customer.phone": MASKED_PHONE,
          },
        },
      );
    }

    // ...and every order is unlinked, so a future account with the same email
    // does not inherit them and no query is blocked by this user id.
    await db.collection("orders").updateMany(
      {
        $or: [{ userId: idString }, ...(userEmail ? [{ userEmail }] : [])],
      },
      { $set: { userId: null, userEmail: null } },
    );

    // 6b. Personal data
    await db.collection("addresses").deleteMany({
      $or: [{ userId: idString }, ...(userEmail ? [{ userEmail }] : [])],
    });

    if (userEmail) {
      await db.collection("subscribers").deleteMany({ email: userEmail });
      // Unused sign-in links / verification tokens for this email
      await db
        .collection("verification_tokens")
        .deleteMany({ identifier: userEmail });
    }

    // 6c. NextAuth collections
    await db.collection("sessions").deleteMany({ userId: { $in: idMatches } });
    await db.collection("accounts").deleteMany({ userId: { $in: idMatches } });

    // 6d. The user record itself. The email is free to register again.
    const deleted = await users.deleteOne({ _id: user._id });
    if (deleted.deletedCount !== 1) {
      return respond(
        {
          success: false,
          error: "Could not delete the account. Please try again.",
        },
        500,
      );
    }

    // 7. Confirmation email (a failed email must not undo the deletion)
    if (userEmail) {
      await sendAccountDeletedEmail({ to: userEmail, name: user.name });
    }

    // 8. End the session: expire every auth cookie on this response
    const res = NextResponse.json(
      {
        success: true,
        message: "Your account has been deleted.",
      } satisfies ApiResult,
      { status: 200 },
    );
    clearAuthCookies(req, res);
    return res;
  } catch (error) {
    console.error("Delete account error:", error);
    return respond(
      { success: false, error: "Something went wrong. Please try again." },
      500,
    );
  }
}
