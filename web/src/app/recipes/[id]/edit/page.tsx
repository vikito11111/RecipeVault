import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { recipes, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import RecipeForm from "@/components/RecipeForm";

interface Props { params: Promise<{ id: string }> }

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const recipeId = parseInt(id);
  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);
  if (!recipe) notFound();
  if (recipe.userId !== session.userId && session.role !== "admin") redirect("/");

  const cats = await db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.name);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Recipe</h1>
      <RecipeForm categories={cats} recipe={recipe} />
    </div>
  );
}
