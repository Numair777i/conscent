import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const userQuery = [
    ...(session.user.id ? [{ userId: session.user.id }] : []),
    ...(session.user.email
      ? [{ userEmail: session.user.email.toLowerCase().trim() }]
      : []),
  ];

  const addresses = await db
    .collection("addresses")
    .find({ $or: userQuery })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray();

  return NextResponse.json({ success: true, addresses });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const client = await clientPromise;
  const db = client.db();

  // Handle both field naming schemes gracefully
  const fullName = body.fullName?.trim();
  const phone = (body.phone || body.phoneNumber)?.trim();
  const address = (body.address || body.street)?.trim();
  const city = body.city?.trim();
  const state = body.state?.trim();
  const pincode = (body.pincode || body.postalCode)?.trim();
  const type = body.type || "HOME";

  if (!fullName || !phone || !address || !city || !state || !pincode) {
    return NextResponse.json(
      { error: "All address fields are required" },
      { status: 400 },
    );
  }

  const userQuery = [
    ...(session.user.id ? [{ userId: session.user.id }] : []),
    ...(session.user.email
      ? [{ userEmail: session.user.email.toLowerCase().trim() }]
      : []),
  ];

  // Count existing addresses to decide default state
  const existingCount = await db
    .collection("addresses")
    .countDocuments({ $or: userQuery });

  const shouldBeDefault = Boolean(body.isDefault) || existingCount === 0;

  // If this address is default, reset previous default addresses
  if (shouldBeDefault) {
    await db
      .collection("addresses")
      .updateMany({ $or: userQuery }, { $set: { isDefault: false } });
  }

  const newAddress = {
    userId: session.user.id || "",
    userEmail: session.user.email?.toLowerCase().trim() || "",
    type,
    fullName,
    phone,
    address,
    city,
    state,
    pincode,
    isDefault: shouldBeDefault,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("addresses").insertOne(newAddress);

  return NextResponse.json(
    {
      success: true,
      address: { ...newAddress, _id: result.insertedId },
    },
    { status: 201 },
  );
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const userQuery = [
    ...(session.user.id ? [{ userId: session.user.id }] : []),
    ...(session.user.email
      ? [{ userEmail: session.user.email.toLowerCase().trim() }]
      : []),
  ];

  await db.collection("addresses").deleteOne({
    _id: new ObjectId(id),
    $or: userQuery,
  });

  return NextResponse.json({ success: true });
}
