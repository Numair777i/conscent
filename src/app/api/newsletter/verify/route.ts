import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://conscentfragrances.com";

  if (!token) {
    return NextResponse.redirect(`${appUrl}?newsletter=invalid`);
  }

  try {
    await connectDB();

    const subscriber = await Subscriber.findOne({
      verifyToken: token,
      tokenExpires: { $gt: new Date() },
    });

    if (!subscriber) {
      return NextResponse.redirect(`${appUrl}?newsletter=expired`);
    }

    subscriber.isVerified = true;
    subscriber.verifyToken = undefined;
    subscriber.tokenExpires = undefined;
    await subscriber.save();

    return NextResponse.redirect(`${appUrl}?newsletter=verified`);
  } catch (err) {
    console.error("Newsletter verification error:", err);
    return NextResponse.redirect(`${appUrl}?newsletter=error`);
  }
}
