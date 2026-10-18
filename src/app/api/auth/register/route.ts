import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();
    const email = body?.email?.toLowerCase().trim();
    const password = body?.password;

    if (!name || name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter your full name (at least 2 characters).",
        },
        { status: 400 },
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long.",
        },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check for existing user
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Hash password with salt work factor 12
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        userId: result.insertedId.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during registration." },
      { status: 500 },
    );
  }
}
