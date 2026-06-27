import { client, writeClient } from "@/sanity/lib/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Validate email format
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 409 },
      );
    }

    // Check if user already exists
    const existingUser = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: email },
    );
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password (server-client only)
    const hashPassword = await bcrypt.hash(password, 10);

    // Get default user-role
    const defaultRole = await client.fetch(
      `*[_type == "userRole" && slug.current == "user"][0]{
    _id}`,
    );

    // Create user
    const newUser = await writeClient.create({
      _type: "user",
      name,
      email,
      password: hashPassword,
      provider: "credentials",
      role: defaultRole
        ? {
            _type: "reference",
            _ref: defaultRole._id,
          }
        : undefined,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        userId: newUser._id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("Signup error", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
};
