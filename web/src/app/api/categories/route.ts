import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, recipes } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const data = await db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    description: categories.description,
    imageUrl: categories.imageUrl,
    recipeCount: count(recipes.id),
  })
    .from(categories)
    .leftJoin(recipes, eq(categories.id, recipes.categoryId))
    .groupBy(categories.id)
    .orderBy(categories.name);

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { name, slug, description, imageUrl } = await req.json();
  const [category] = await db.insert(categories).values({ name, slug, description, imageUrl }).returning();
  return NextResponse.json({ category }, { status: 201 });
}
