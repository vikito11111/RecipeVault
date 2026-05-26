import Link from "next/link";
import { db } from "@/db";
import { categories, recipes } from "@/db/schema";
import { eq, count } from "drizzle-orm";

const categoryEmojis: Record<string, string> = {
  italian: "🍝", asian: "🍜", mexican: "🌮", desserts: "🍰",
  vegetarian: "🥗", american: "🍔", mediterranean: "🫒", indian: "🍛",
};

export default async function CategoriesPage() {
  let cats: any[] = [];
  try {
    cats = await db.select({
      id: categories.id, name: categories.name, slug: categories.slug, description: categories.description,
      recipeCount: count(recipes.id),
    })
      .from(categories)
      .leftJoin(recipes, eq(categories.id, recipes.categoryId))
      .groupBy(categories.id)
      .orderBy(categories.name);
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Recipe Categories</h1>
      <p className="text-gray-500 mb-8">Browse recipes by category</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {cats.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}
            className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
            <div className="text-5xl mb-4">{categoryEmojis[cat.slug] || "🍽️"}</div>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{cat.name}</h2>
            <p className="text-sm text-gray-400 mt-1 mb-3">{cat.description}</p>
            <div className="inline-block bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full">
              {Number(cat.recipeCount).toLocaleString()} recipes
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
