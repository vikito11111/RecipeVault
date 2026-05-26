import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, recipes, categories, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 12;
  const offset = (page - 1) * limit;

  const data = await db.select({
    id: favorites.id,
    createdAt: favorites.createdAt,
    recipe: {
      id: recipes.id,
      title: recipes.title,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      prepTime: recipes.prepTime,
      cookTime: recipes.cookTime,
      difficulty: recipes.difficulty,
    },
    category: { name: categories.name, slug: categories.slug },
  })
    .from(favorites)
    .leftJoin(recipes, eq(favorites.recipeId, recipes.id))
    .leftJoin(categories, eq(recipes.categoryId, categories.id))
    .where(eq(favorites.userId, session.userId))
    .orderBy(desc(favorites.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipeId } = await req.json();

  const existing = await db.select().from(favorites)
    .where(and(eq(favorites.recipeId, recipeId), eq(favorites.userId, session.userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(favorites).where(and(eq(favorites.recipeId, recipeId), eq(favorites.userId, session.userId)));
    return NextResponse.json({ favorited: false });
  }

  await db.insert(favorites).values({ recipeId, userId: session.userId });
  return NextResponse.json({ favorited: true }, { status: 201 });
}
