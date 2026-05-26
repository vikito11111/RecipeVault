import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import { db } from "@/db";
import { recipes, categories, users } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

async function getFeaturedRecipes() {
  return db.select({
    id: recipes.id,
    title: recipes.title,
    description: recipes.description,
    imageUrl: recipes.imageUrl,
    prepTime: recipes.prepTime,
    cookTime: recipes.cookTime,
    difficulty: recipes.difficulty,
    views: recipes.views,
    category: { id: categories.id, name: categories.name, slug: categories.slug },
    author: { id: users.id, name: users.name },
  })
    .from(recipes)
    .leftJoin(categories, eq(recipes.categoryId, categories.id))
    .leftJoin(users, eq(recipes.userId, users.id))
    .where(eq(recipes.isPublished, true))
    .orderBy(desc(recipes.views))
    .limit(8);
}

async function getCategories() {
  return db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    description: categories.description,
    recipeCount: count(recipes.id),
  })
    .from(categories)
    .leftJoin(recipes, eq(categories.id, recipes.categoryId))
    .groupBy(categories.id)
    .orderBy(categories.name)
    .limit(8);
}

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedRecipes>> = [];
  let cats: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [featured, cats] = await Promise.all([getFeaturedRecipes(), getCategories()]);
  } catch {
    // DB not connected yet - show placeholder
  }

  const categoryEmojis: Record<string, string> = {
    italian: "🍝", asian: "🍜", mexican: "🌮", desserts: "🍰",
    vegetarian: "🥗", american: "🍔", mediterranean: "🫒", indian: "🍛",
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Discover & Share <span className="text-orange-600">Amazing Recipes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of food lovers. Find recipes for every occasion, share your culinary creations, and connect with fellow cooks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recipes" className="bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200">
              Explore Recipes
            </Link>
            <Link href="/auth/register" className="bg-white text-gray-800 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
              Share Yours
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-sm mx-auto text-center">
            <div><div className="text-3xl font-bold text-orange-600">10K+</div><div className="text-sm text-gray-500 mt-1">Recipes</div></div>
            <div><div className="text-3xl font-bold text-orange-600">50+</div><div className="text-sm text-gray-500 mt-1">Chefs</div></div>
            <div><div className="text-3xl font-bold text-orange-600">8</div><div className="text-sm text-gray-500 mt-1">Categories</div></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {cats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Browse Categories</h2>
            <Link href="/categories" className="text-orange-600 hover:text-orange-700 font-medium">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {cats.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}
                className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                <div className="text-4xl mb-3">{categoryEmojis[cat.slug] || "🍽️"}</div>
                <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{cat.name}</div>
                <div className="text-sm text-gray-400 mt-1">{Number(cat.recipeCount)} recipes</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Recipes */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Most Popular</h2>
            <Link href="/recipes" className="text-orange-600 hover:text-orange-700 font-medium">See all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((r) => <RecipeCard key={r.id} {...r} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-orange-600 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to share your recipes?</h2>
          <p className="text-orange-100 text-lg mb-8">Join our community and start sharing your culinary creations with food lovers worldwide.</p>
          <Link href="/auth/register" className="bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-50 transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
