import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(users).values({ name, email, passwordHash }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const cookieOpts = setAuthCookie(token);

    const response = NextResponse.json({ user, token }, { status: 201 });
    response.cookies.set(cookieOpts);
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
