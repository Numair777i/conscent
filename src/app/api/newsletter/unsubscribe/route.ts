import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://conscentfragrances.com";

  if (email) {
    await connectDB();
    await Subscriber.deleteOne({ email: email.toLowerCase().trim() });
  }

  return NextResponse.redirect(`${appUrl}?unsubscribed=true`);
}
