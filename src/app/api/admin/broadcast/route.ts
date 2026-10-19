import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";
import { sendBroadcastEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const AUTHORIZED_ADMIN_EMAIL = "conscent7@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isSessionAdmin =
      session?.user?.email?.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL;

    const authHeader = req.headers.get("authorization");
    const isTokenAdmin =
      process.env.ADMIN_SECRET &&
      authHeader === `Bearer ${process.env.ADMIN_SECRET}`;

    if (!isSessionAdmin && !isTokenAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, headline, bodyText, ctaText, ctaUrl } = await req.json();

    if (!subject || !headline || !bodyText) {
      return NextResponse.json(
        { error: "Subject, headline, and message body are required." },
        { status: 400 },
      );
    }

    await connectDB();

    // Fetch only double-opted verified subscribers
    const recipients = await Subscriber.find({ isVerified: true })
      .select("email")
      .lean();

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: "No verified subscribers found in database.",
      });
    }

    // Send emails sequentially or in small concurrency batches to respect Resend rate limits
    let sentCount = 0;
    for (const sub of recipients) {
      await sendBroadcastEmail(sub.email, {
        subject,
        headline,
        bodyMarkdown: bodyText,
        ctaText,
        ctaUrl,
      });
      sentCount++;
      // 100ms pause prevents hitting free-tier burst limits
      await new Promise((r) => setTimeout(r, 100));
    }

    return NextResponse.json({
      success: true,
      sentCount,
      message: `Broadcast delivered to ${sentCount} verified subscriber(s).`,
    });
  } catch (error) {
    console.error("Broadcast failed:", error);
    return NextResponse.json(
      { error: "Failed to dispatch broadcast campaign." },
      { status: 500 },
    );
  }
}
