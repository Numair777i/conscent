import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin")?.replace(/\D/g, "");

    if (!pin || pin.length !== 6 || pin.startsWith("0")) {
      return NextResponse.json(
        { success: false, error: "Invalid 6-digit Indian PIN code" },
        { status: 400 },
      );
    }

    // 1. Fetch official Postal data with 4s timeout and 24h ISR caching
    const postalRes = await fetch(
      `https://api.postalpincode.in/pincode/${pin}`,
      {
        next: { revalidate: 86400 }, // Cache postal data for 24 hours
        signal: AbortSignal.timeout(4000),
      },
    );

    const postalData = await postalRes.json();

    if (
      !postalData ||
      postalData[0]?.Status !== "Success" ||
      !postalData[0]?.PostOffice?.length
    ) {
      return NextResponse.json(
        {
          success: false,
          serviceable: false,
          error: "PIN code not found in postal registry",
        },
        { status: 404 },
      );
    }

    const firstMatch = postalData[0].PostOffice[0];
    const city = (
      firstMatch.District ||
      firstMatch.Block ||
      firstMatch.Name ||
      ""
    ).trim();
    const state = (firstMatch.State || "").trim();

    const cityLower = city.toLowerCase();
    const stateLower = state.toLowerCase();

    // 2. Compute Surface Express delivery window based on origin (Delhi)
    const isDelhiNCR =
      stateLower === "delhi" ||
      [
        "gurgaon",
        "gurugram",
        "noida",
        "greater noida",
        "faridabad",
        "ghaziabad",
      ].some((d) => cityLower.includes(d));

    const isMetro = [
      "mumbai",
      "bengaluru",
      "bangalore",
      "kolkata",
      "chennai",
      "hyderabad",
      "pune",
      "ahmedabad",
    ].some((m) => cityLower.includes(m));

    const estimatedDays = isDelhiNCR
      ? "1–2 business days"
      : isMetro
        ? "3–4 business days"
        : "4–6 business days";

    return NextResponse.json({
      success: true,
      serviceable: true,
      pincode: pin,
      city,
      state,
      estimatedDays,
      carrier: "Delhivery Surface Express",
    });
  } catch (error) {
    console.error("Postal API lookup failed/timed out:", error);
    // Graceful fallback so checkout is never blocked by upstream outages
    return NextResponse.json({
      success: true,
      serviceable: true,
      estimatedDays: "3–5 business days",
      carrier: "Delhivery Surface Express",
    });
  }
}
