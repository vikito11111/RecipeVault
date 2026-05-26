import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, recipes, categories } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, count } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id);

  const [user] = await db.select({
    id: users.id,
    name: users.name,
    bio: users.bio,
    avatarUrl: users.avatarUrl,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, userId)).limit(1);

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userRecipes = await db.select({
    id: recipes.id,
    title: recipes.title,
    description: recipes.description,
    imageUrl: recipes.imageUrl,
    prepTime: recipes.prepTime,
    cookTime: recipes.cookTime,
    difficulty: recipes.difficulty,
    views: recipes.views,
    createdAt: recipes.createdAt,
    category: { name: categories.name, slug: categories.slug },
  })
    .from(recipes)
    .leftJoin(categories, eq(recipes.categoryId, categories.id))
    .where(eq(recipes.userId, userId))
    .orderBy(desc(recipes.createdAt))
    .limit(20);

  return NextResponse.json({ user, recipes: userRecipes });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(id);

  if (session.userId !== userId && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, bio, avatarUrl } = await req.json();
  const [updated] = await db.update(users).set({ name, bio, avatarUrl, updatedAt: new Date() })
    .where(eq(users.id, userId)).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
    });

  return NextResponse.json({ user: updated });
}
