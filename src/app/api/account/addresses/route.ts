import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const addresses = await db
    .collection("addresses")
    .find({ userId: session.user.id })
    .toArray();

  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const client = await clientPromise;
  const db = client.db();

  const newAddress = {
    userId: session.user.id,
    fullName: body.fullName,
    phoneNumber: body.phoneNumber,
    street: body.street,
    city: body.city,
    state: body.state,
    postalCode: body.postalCode,
    isDefault: Boolean(body.isDefault),
    createdAt: new Date(),
  };

  const result = await db.collection("addresses").insertOne(newAddress);
  return NextResponse.json({ success: true, id: result.insertedId });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();

  await db.collection("addresses").deleteOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  });

  return NextResponse.json({ success: true });
}
