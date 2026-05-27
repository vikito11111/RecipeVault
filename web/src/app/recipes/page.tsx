import { Suspense } from "react";
import RecipeCard from "@/components/RecipeCard";
import Pagination from "@/components/Pagination";
import { db } from "@/db";
import { recipes, categories, users } from "@/db/schema";
import { eq, desc, ilike, and, count } from "drizzle-orm";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; category?: string; difficulty?: string }>;
}

async function getCategories() {
  return db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).orderBy(categories.name);
}

async function getRecipes(page: number, search: string, categoryId: string, difficulty: string) {
  const limit = 12;
  const offset = (page - 1) * limit;
  const conditions = [eq(recipes.isPublished, true)];
  if (search) conditions.push(ilike(recipes.title, `%${search}%`));
  if (categoryId) conditions.push(eq(recipes.categoryId, parseInt(categoryId)));
  if (difficulty) conditions.push(eq(recipes.difficulty, difficulty as "easy" | "medium" | "hard"));
  const where = and(...conditions);

  const [total, data] = await Promise.all([
    db.select({ count: count() }).from(recipes).where(where),
    db.select({
      id: recipes.id, title: recipes.title, description: recipes.description, imageUrl: recipes.imageUrl,
      prepTime: recipes.prepTime, cookTime: recipes.cookTime, difficulty: recipes.difficulty,
      category: { id: categories.id, name: categories.name, slug: categories.slug },
      author: { id: users.id, name: users.name },
    })
      .from(recipes)
      .leftJoin(categories, eq(recipes.categoryId, categories.id))
      .leftJoin(users, eq(recipes.userId, users.id))
      .where(where).orderBy(desc(recipes.createdAt)).limit(limit).offset(offset),
  ]);
  return { data, total: Number(total[0]?.count ?? 0), pages: Math.ceil(Number(total[0]?.count ?? 0) / limit) };
}

export default async function RecipesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const search = sp.search || "";
  const category = sp.category || "";
  const difficulty = sp.difficulty || "";

  let cats: Awaited<ReturnType<typeof getCategories>> = [];
  let result = { data: [] as any[], total: 0, pages: 0 };

  try {
    [cats, result] = await Promise.all([getCategories(), getRecipes(page, search, category, difficulty)]);
  } catch {
    // DB not connected
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Recipes</h1>
          <p className="text-gray-500 mt-1">{result.total.toLocaleString()} recipes found</p>
        </div>
        <Link href="/recipes/new" className="bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 font-medium text-sm self-start">+ Add Recipe</Link>
      </div>

      {/* Filters */}
      <form method="GET" className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
            <input
              name="search"
              defaultValue={search}
              placeholder="Search recipes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
            <select
              name="category"
              defaultValue={category}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
            >
              <option value="">All Categories</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Difficulty</label>
            <select
              name="difficulty"
              defaultValue={difficulty}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
            >
              <option value="">Any Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="flex-1 bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 font-medium text-sm transition-colors">
              Filter
            </button>
            {(search || category || difficulty) && (
              <a href="/recipes" className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                Clear
              </a>
            )}
          </div>
        </div>
      </form>

      {result.data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-xl font-medium">No recipes found</p>
          <p className="text-sm mt-2">Try adjusting your filters or <Link href="/recipes/new" className="text-orange-600">add the first one!</Link></p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {result.data.map((r: any) => <RecipeCard key={r.id} {...r} />)}
          </div>
          <Suspense><Pagination page={page} pages={result.pages} total={result.total} /></Suspense>
        </>
      )}
    </div>
  );
}
