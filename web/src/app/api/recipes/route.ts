import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, users, categories, reviews, favorites } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, ilike, and, count, avg, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "12"));
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const offset = (page - 1) * limit;

  const conditions = [eq(recipes.isPublished, true)];
  if (search) conditions.push(ilike(recipes.title, `%${search}%`));
  if (categoryId) conditions.push(eq(recipes.categoryId, parseInt(categoryId)));
  if (difficulty) conditions.push(eq(recipes.difficulty, difficulty as "easy" | "medium" | "hard"));

  const where = and(...conditions);

  const [totalResult, data] = await Promise.all([
    db.select({ count: count() }).from(recipes).where(where),
    db.select({
      id: recipes.id,
      title: recipes.title,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      prepTime: recipes.prepTime,
      cookTime: recipes.cookTime,
      servings: recipes.servings,
      difficulty: recipes.difficulty,
      views: recipes.views,
      createdAt: recipes.createdAt,
      category: { id: categories.id, name: categories.name, slug: categories.slug },
      author: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
      .from(recipes)
      .leftJoin(categories, eq(recipes.categoryId, categories.id))
      .leftJoin(users, eq(recipes.userId, users.id))
      .where(where)
      .orderBy(desc(recipes.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  const total = totalResult[0]?.count ?? 0;
  return NextResponse.json({ data, total, page, limit, pages: Math.ceil(Number(total) / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, ingredients, instructions, categoryId, imageUrl, prepTime, cookTime, servings, difficulty } = body;

  if (!title || !description || !ingredients || !instructions || !categoryId) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const [recipe] = await db.insert(recipes).values({
    title,
    description,
    ingredients,
    instructions,
    categoryId: parseInt(categoryId),
    userId: session.userId,
    imageUrl,
    prepTime: parseInt(prepTime) || 0,
    cookTime: parseInt(cookTime) || 0,
    servings: parseInt(servings) || 4,
    difficulty: difficulty || "medium",
  }).returning();

  return NextResponse.json({ recipe }, { status: 201 });
}
