import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { favorites, recipes, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const data = await db.select({
    id: favorites.id,
    recipe: {
      id: recipes.id, title: recipes.title, description: recipes.description, imageUrl: recipes.imageUrl,
      prepTime: recipes.prepTime, cookTime: recipes.cookTime, difficulty: recipes.difficulty,
    },
    category: { id: categories.id, name: categories.name, slug: categories.slug },
  })
    .from(favorites)
    .leftJoin(recipes, eq(favorites.recipeId, recipes.id))
    .leftJoin(categories, eq(recipes.categoryId, categories.id))
    .where(eq(favorites.userId, session.userId))
    .orderBy(desc(favorites.createdAt))
    .limit(50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-orange-600">Dashboard</Link><span>/</span>
        <span className="text-gray-800">Favorites</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Saved Recipes ({data.length})</h1>
      {data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">♡</div>
          <p className="text-xl font-medium">No saved recipes yet</p>
          <Link href="/recipes" className="text-orange-600 mt-2 block hover:text-orange-700">Browse recipes →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((f) => f.recipe && <RecipeCard key={f.id} {...f.recipe} category={f.category} />)}
        </div>
      )}
    </div>
  );
}
