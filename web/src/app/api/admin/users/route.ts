import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, recipes } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, count, ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = searchParams.get("search") || "";

  const where = search ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)) : undefined;

  const [totalResult, data] = await Promise.all([
    db.select({ count: count() }).from(users).where(where),
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).where(where).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
  ]);

  return NextResponse.json({ data, total: totalResult[0]?.count ?? 0, page, limit });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { userId, role } = await req.json();
  const [updated] = await db.update(users).set({ role }).where(eq(users.id, userId)).returning({
    id: users.id, name: users.name, email: users.email, role: users.role,
  });
  return NextResponse.json({ user: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (userId === session.userId) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  await db.delete(users).where(eq(users.id, userId));
  return NextResponse.json({ message: "User deleted" });
}
