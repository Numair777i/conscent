import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+\$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const client = await clientPromise;
    const db = client.db();

    const user = await db
      .collection("users")
      .findOne({ email: normalizedEmail });

    // Always return a positive message even if user doesn't exist (prevents email enumeration attacks)
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a reset link has been dispatched.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour

    await db.collection("users").updateOne(
      { email: normalizedEmail },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
        },
      },
    );

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.conscentfragrances.com";
    const resetLink = `${appUrl}/account/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from:
          process.env.EMAIL_FROM || "CONSCENT <support@conscentfragrances.com>",
        to: [normalizedEmail],
        subject: "Reset Your Account Password | CONSCENT Fragrances",
        html: `
          <div style="background-color: #000000; color: #ffffff; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 520px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #222222; padding: 32px; border-radius: 8px;">
              <h1 style="font-size: 24px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0; font-weight: 800; color: #ffffff;">
                CONS<span style="color: #e11d48;">CENT</span>
              </h1>
              <p style="margin: 6px 0 24px 0; color: #888888; font-size: 13px;">Scent you can't say no to.</p>
              
              <h2 style="font-size: 18px; margin: 0 0 12px 0;">Password Reset Request</h2>
              <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0 0 28px 0;">
                We received a request to reset your password. Click the button below to choose a new password. This link is active for <strong>60 minutes</strong>.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" 
                   style="background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 12px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; border-radius: 4px; display: inline-block;">
                  Reset Password
                </a>
              </div>

              <p style="color: #777; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
                If you did not initiate this request, you can safely ignore this email. Your password will remain unchanged.
              </p>

              <div style="border-top: 1px solid #222222; margin-top: 32px; padding-top: 16px; font-size: 11px; color: #555; text-align: center;">
                <p style="margin: 0;">Support: <a href="mailto:support@conscentfragrances.com" style="color: #e11d48; text-decoration: none;">support@conscentfragrances.com</a></p>
              </div>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a reset link has been dispatched.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 },
    );
  }
}
