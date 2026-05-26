import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, categories, recipes, reviews } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { count } from "drizzle-orm";

const CATEGORY_DATA = [
  { name: "Italian", slug: "italian", description: "Classic Italian cuisine" },
  { name: "Asian", slug: "asian", description: "Asian inspired dishes" },
  { name: "Mexican", slug: "mexican", description: "Mexican and Latin flavors" },
  { name: "Desserts", slug: "desserts", description: "Sweet treats and baked goods" },
  { name: "Vegetarian", slug: "vegetarian", description: "Meat-free dishes" },
  { name: "American", slug: "american", description: "American comfort food" },
  { name: "Mediterranean", slug: "mediterranean", description: "Mediterranean cuisine" },
  { name: "Indian", slug: "indian", description: "Indian spiced dishes" },
];

const ADJECTIVES = ["Crispy", "Creamy", "Spicy", "Sweet", "Savory", "Tangy", "Hearty", "Light", "Rich", "Fresh", "Smoky", "Zesty", "Golden", "Tender", "Fluffy"];
const NOUNS = ["Pasta", "Soup", "Salad", "Curry", "Stew", "Bread", "Cake", "Pie", "Bowl", "Wrap", "Tacos", "Risotto", "Noodles", "Burger", "Steak", "Chicken", "Salmon", "Pizza", "Pancakes", "Cookies"];
const DIFFICULTIES: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST() {
  const [existing] = await db.select({ count: count() }).from(categories);
  if (Number(existing.count) > 0) {
    return NextResponse.json({ message: "Database already seeded" });
  }

  const passwordHash = await hashPassword("demo123");

  const [admin] = await db.insert(users).values({
    name: "Admin User",
    email: "admin@recipevault.com",
    passwordHash,
    role: "admin",
    bio: "Platform administrator",
  }).returning();

  const regularUsers = await db.insert(users).values(
    Array.from({ length: 50 }, (_, i) => ({
      name: `Chef User ${i + 1}`,
      email: `user${i + 1}@recipevault.com`,
      passwordHash,
      bio: `Food lover and home cook #${i + 1}`,
    }))
  ).returning();

  const allUsers = [admin, ...regularUsers];

  const insertedCategories = await db.insert(categories).values(CATEGORY_DATA).returning();

  const BATCH_SIZE = 500;
  const TOTAL_RECIPES = 10000;
  const allRecipeIds: number[] = [];

  for (let batch = 0; batch < Math.ceil(TOTAL_RECIPES / BATCH_SIZE); batch++) {
    const batchData = Array.from({ length: Math.min(BATCH_SIZE, TOTAL_RECIPES - batch * BATCH_SIZE) }, (_, i) => {
      const adj = randomItem(ADJECTIVES);
      const noun = randomItem(NOUNS);
      const num = batch * BATCH_SIZE + i + 1;
      return {
        title: `${adj} ${noun} #${num}`,
        description: `A delicious ${adj.toLowerCase()} ${noun.toLowerCase()} recipe that everyone will love. Perfect for any occasion.`,
        ingredients: `2 cups flour\n1 cup milk\n3 eggs\n1 tsp salt\n2 tbsp olive oil\n1 onion, diced\n3 garlic cloves\n1 tsp pepper`,
        instructions: `1. Prepare all ingredients.\n2. Mix dry ingredients together.\n3. Add wet ingredients and combine.\n4. Cook on medium heat for ${randomInt(10, 30)} minutes.\n5. Season to taste and serve hot.`,
        categoryId: randomItem(insertedCategories).id,
        userId: randomItem(allUsers).id,
        prepTime: randomInt(5, 30),
        cookTime: randomInt(10, 60),
        servings: randomInt(2, 8),
        difficulty: randomItem(DIFFICULTIES),
        views: randomInt(0, 5000),
      };
    });

    const inserted = await db.insert(recipes).values(batchData).returning({ id: recipes.id });
    allRecipeIds.push(...inserted.map((r) => r.id));
  }

  const reviewData = allRecipeIds.slice(0, 2000).flatMap((recipeId) =>
    Array.from({ length: randomInt(1, 3) }, () => ({
      recipeId,
      userId: randomItem(allUsers).id,
      rating: randomInt(1, 5),
      comment: randomItem(["Great recipe!", "Easy to follow.", "Will make again.", "Delicious!", "My family loved it.", null, null]) as string | undefined,
    }))
  );

  for (let i = 0; i < reviewData.length; i += 500) {
    await db.insert(reviews).values(reviewData.slice(i, i + 500));
  }

  return NextResponse.json({
    message: "Database seeded successfully",
    stats: { users: allUsers.length, categories: insertedCategories.length, recipes: allRecipeIds.length, reviews: reviewData.length },
  });
}
