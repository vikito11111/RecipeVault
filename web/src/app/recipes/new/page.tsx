import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getSession } from "@/lib/auth";
import RecipeForm from "@/components/RecipeForm";

export default async function NewRecipePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const cats = await db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.name);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Recipe</h1>
      <RecipeForm categories={cats} />
    </div>
  );
}
