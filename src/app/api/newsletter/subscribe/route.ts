import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";
import { sendNewsletterVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: normalizedEmail });

    if (existing && existing.isVerified) {
      return NextResponse.json({
        success: true,
        message: "You are already a verified CONSCENT subscriber.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hrs

    await Subscriber.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          verifyToken: token,
          tokenExpires,
          isVerified: false,
        },
      },
      { upsert: true, new: true },
    );

    await sendNewsletterVerificationEmail(normalizedEmail, token);

    return NextResponse.json({
      success: true,
      message: "Verification email sent. Please check your inbox to confirm.",
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Could not process subscription. Please try again." },
      { status: 500 },
    );
  }
}
