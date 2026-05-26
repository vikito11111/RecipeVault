import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, users, categories } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, count, ilike } from "drizzle-orm";

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

  const where = search ? ilike(recipes.title, `%${search}%`) : undefined;

  const [totalResult, data] = await Promise.all([
    db.select({ count: count() }).from(recipes).where(where),
    db.select({
      id: recipes.id,
      title: recipes.title,
      isPublished: recipes.isPublished,
      views: recipes.views,
      createdAt: recipes.createdAt,
      author: { id: users.id, name: users.name },
      category: { id: categories.id, name: categories.name },
    })
      .from(recipes)
      .leftJoin(users, eq(recipes.userId, users.id))
      .leftJoin(categories, eq(recipes.categoryId, categories.id))
      .where(where)
      .orderBy(desc(recipes.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  return NextResponse.json({ data, total: totalResult[0]?.count ?? 0, page, limit });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { recipeId, isPublished } = await req.json();
  const [updated] = await db.update(recipes).set({ isPublished }).where(eq(recipes.id, recipeId)).returning();
  return NextResponse.json({ recipe: updated });
}
