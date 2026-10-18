import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Builds a safe, non-empty ownership filter for the current session
function getUserFilter(session: {
  user?: { id?: string; email?: string | null };
}) {
  const filters: Array<{ userId?: string; userEmail?: string }> = [];

  if (session.user?.id) {
    filters.push({ userId: session.user.id });
  }
  if (session.user?.email) {
    filters.push({ userEmail: session.user.email.toLowerCase().trim() });
  }

  if (filters.length === 0) return null;
  if (filters.length === 1) return filters[0];
  return { $or: filters };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userFilter = getUserFilter(session);
    if (!userFilter) {
      return NextResponse.json(
        { success: false, error: "User identity missing" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const addresses = await db
      .collection("addresses")
      .find(userFilter)
      .sort({ isDefault: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch addresses" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userFilter = getUserFilter(session);
    if (!userFilter) {
      return NextResponse.json(
        { success: false, error: "User identity missing" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const fullName = body.fullName?.trim();
    const phone = String(body.phone || body.phoneNumber || "")
      .replace(/\D/g, "")
      .slice(-10);
    const address = (body.address || body.street)?.trim();
    const city = body.city?.trim();
    const state = body.state?.trim();
    const pincode = String(body.pincode || body.postalCode || "")
      .replace(/\D/g, "")
      .slice(0, 6);
    const type = ["HOME", "WORK", "OTHER"].includes(body.type)
      ? body.type
      : "HOME";

    if (
      !fullName ||
      phone.length !== 10 ||
      !address ||
      !city ||
      !state ||
      pincode.length !== 6
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valid name, 10-digit phone, address, city, state, and 6-digit PIN are required.",
        },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const existingCount = await db
      .collection("addresses")
      .countDocuments(userFilter);
    const shouldBeDefault = Boolean(body.isDefault) || existingCount === 0;

    // Reset previous default addresses if this one is default
    if (shouldBeDefault) {
      await db
        .collection("addresses")
        .updateMany(userFilter, { $set: { isDefault: false } });
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
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save address" },
      { status: 500 },
    );
  }
}

// EDIT / UPDATE EXISTING ADDRESS
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userFilter = getUserFilter(session);
    if (!userFilter) {
      return NextResponse.json(
        { success: false, error: "User identity missing" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const id = body._id || body.id;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Valid address ID is required" },
        { status: 400 },
      );
    }

    const fullName = body.fullName?.trim();
    const phone = body.phone
      ? String(body.phone).replace(/\D/g, "").slice(-10)
      : undefined;
    const address = (body.address || body.street)?.trim();
    const city = body.city?.trim();
    const state = body.state?.trim();
    const pincode = body.pincode
      ? String(body.pincode).replace(/\D/g, "").slice(0, 6)
      : undefined;
    const type = ["HOME", "WORK", "OTHER"].includes(body.type)
      ? body.type
      : undefined;

    const client = await clientPromise;
    const db = client.db();

    // If making this address the default, clear other defaults first
    if (body.isDefault === true) {
      await db
        .collection("addresses")
        .updateMany(userFilter, { $set: { isDefault: false } });
    }

    const updateDoc: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (fullName) updateDoc.fullName = fullName;
    if (phone && phone.length === 10) updateDoc.phone = phone;
    if (address) updateDoc.address = address;
    if (city) updateDoc.city = city;
    if (state) updateDoc.state = state;
    if (pincode && pincode.length === 6) updateDoc.pincode = pincode;
    if (type) updateDoc.type = type;
    if (typeof body.isDefault === "boolean")
      updateDoc.isDefault = body.isDefault;

    const result = await db.collection("addresses").findOneAndUpdate(
      {
        _id: new ObjectId(id),
        ...userFilter,
      },
      { $set: updateDoc },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Address not found or unauthorized to edit" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, address: result });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update address" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Valid address ID is required" },
        { status: 400 },
      );
    }

    const userFilter = getUserFilter(session);
    if (!userFilter) {
      return NextResponse.json(
        { success: false, error: "User identity missing" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const deleteResult = await db.collection("addresses").deleteOne({
      _id: new ObjectId(id),
      ...userFilter,
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Address not found or unauthorized to delete",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete address" },
      { status: 500 },
    );
  }
}
