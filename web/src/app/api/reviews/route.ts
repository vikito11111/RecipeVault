import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipeId, rating, comment } = await req.json();
  if (!recipeId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const existing = await db.select().from(reviews)
    .where(and(eq(reviews.recipeId, recipeId), eq(reviews.userId, session.userId)))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(reviews).set({ rating, comment })
      .where(and(eq(reviews.recipeId, recipeId), eq(reviews.userId, session.userId)))
      .returning();
    return NextResponse.json({ review: updated });
  }

  const [review] = await db.insert(reviews).values({
    recipeId,
    userId: session.userId,
    rating,
    comment,
  }).returning();

  return NextResponse.json({ review }, { status: 201 });
}
