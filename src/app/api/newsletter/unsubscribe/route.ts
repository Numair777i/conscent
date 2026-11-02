import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  const token = req.nextUrl.searchParams.get("token");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://conscentfragrances.com";

  try {
    // Only a valid signed link (the one we emailed to that address) can unsubscribe it.
    // Without this check, anyone could unsubscribe any email just by typing it in the URL.
    if (!email || !token || !verifyUnsubscribeToken(email, token)) {
      return NextResponse.redirect(`${appUrl}?unsubscribed=invalid`);
    }

    await connectDB();
    await Subscriber.deleteOne({ email });

    return NextResponse.redirect(`${appUrl}?unsubscribed=true`);
  } catch (err) {
    console.error("Newsletter unsubscribe error:", err);
    return NextResponse.redirect(`${appUrl}?unsubscribed=error`);
  }
}
