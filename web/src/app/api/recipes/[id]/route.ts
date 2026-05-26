import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, users, categories, reviews } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, avg, count, sql } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipeId = parseInt(id);

  const [recipe] = await db.select({
    id: recipes.id,
    title: recipes.title,
    description: recipes.description,
    ingredients: recipes.ingredients,
    instructions: recipes.instructions,
    imageUrl: recipes.imageUrl,
    prepTime: recipes.prepTime,
    cookTime: recipes.cookTime,
    servings: recipes.servings,
    difficulty: recipes.difficulty,
    views: recipes.views,
    isPublished: recipes.isPublished,
    createdAt: recipes.createdAt,
    updatedAt: recipes.updatedAt,
    category: { id: categories.id, name: categories.name, slug: categories.slug },
    author: { id: users.id, name: users.name, avatarUrl: users.avatarUrl, bio: users.bio },
  })
    .from(recipes)
    .leftJoin(categories, eq(recipes.categoryId, categories.id))
    .leftJoin(users, eq(recipes.userId, users.id))
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

  await db.update(recipes).set({ views: sql`${recipes.views} + 1` }).where(eq(recipes.id, recipeId));

  const recipeReviews = await db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    createdAt: reviews.createdAt,
    author: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
  })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.recipeId, recipeId))
    .limit(20);

  const avgRating = recipeReviews.length > 0
    ? recipeReviews.reduce((s, r) => s + r.rating, 0) / recipeReviews.length
    : 0;

  return NextResponse.json({ recipe, reviews: recipeReviews, avgRating: Math.round(avgRating * 10) / 10 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const recipeId = parseInt(id);
  const body = await req.json();

  const [existing] = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [updated] = await db.update(recipes).set({
    ...body,
    updatedAt: new Date(),
  }).where(eq(recipes.id, recipeId)).returning();

  return NextResponse.json({ recipe: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const recipeId = parseInt(id);

  const [existing] = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(recipes).where(eq(recipes.id, recipeId));
  return NextResponse.json({ message: "Deleted" });
}
