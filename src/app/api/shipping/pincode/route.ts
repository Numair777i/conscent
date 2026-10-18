import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin")?.replace(/\D/g, "");

    if (!pin || pin.length !== 6 || pin.startsWith("0")) {
      return NextResponse.json(
        { error: "Invalid 6-digit Indian PIN code" },
        { status: 400 },
      );
    }

    // 1. Fetch official Postal data for City & State auto-population
    const postalRes = await fetch(
      `https://api.postalpincode.in/pincode/${pin}`,
      {
        next: { revalidate: 86400 }, // Cache postal data for 24h
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
          serviceable: false,
          error: "PIN code not found in Indian postal registry",
        },
        { status: 404 },
      );
    }

    const firstMatch = postalData[0].PostOffice[0];
    const city = firstMatch.District || firstMatch.Block || firstMatch.Name;
    const state = firstMatch.State;

    // 2. Compute Surface Express estimated delivery window based on region
    const isDelhiNCR =
      state.toLowerCase() === "delhi" ||
      ["gurgaon", "noida", "faridabad", "ghaziabad"].some((d) =>
        city.toLowerCase().includes(d),
      );

    const isMetro = [
      "mumbai",
      "bengaluru",
      "kolkata",
      "chennai",
      "hyderabad",
      "pune",
    ].some((m) => city.toLowerCase().includes(m));

    const estimatedDays = isDelhiNCR
      ? "1–2 business days"
      : isMetro
        ? "3–4 business days"
        : "4–6 business days";

    return NextResponse.json({
      serviceable: true,
      city,
      state,
      estimatedDays,
      carrier: "Delhivery Surface Express",
    });
  } catch (error) {
    console.error("Pincode check failure:", error);
    return NextResponse.json(
      { serviceable: true, estimatedDays: "3–5 business days" },
      { status: 200 },
    );
  }
}
