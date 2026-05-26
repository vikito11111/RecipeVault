import { redirect } from "next/navigation";
import { db } from "@/db";
import { recipes, users, categories } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { desc, count, ilike, eq } from "drizzle-orm";
import Link from "next/link";
import AdminRecipeActions from "./AdminRecipeActions";
import { formatDate } from "@/lib/utils";
import Pagination from "@/components/Pagination";
import { Suspense } from "react";

interface Props { searchParams: Promise<{ page?: string; search?: string }> }

export default async function AdminRecipesPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const search = sp.search || "";
  const limit = 20;
  const offset = (page - 1) * limit;

  const where = search ? ilike(recipes.title, `%${search}%`) : undefined;

  const [totalRes, data] = await Promise.all([
    db.select({ count: count() }).from(recipes).where(where),
    db.select({
      id: recipes.id, title: recipes.title, isPublished: recipes.isPublished, views: recipes.views, createdAt: recipes.createdAt,
      author: { id: users.id, name: users.name },
      category: { id: categories.id, name: categories.name },
    })
      .from(recipes)
      .leftJoin(users, eq(recipes.userId, users.id))
      .leftJoin(categories, eq(recipes.categoryId, categories.id))
      .where(where)
      .orderBy(desc(recipes.createdAt))
      .limit(limit).offset(offset),
  ]);

  const total = Number(totalRes[0]?.count ?? 0);
  const pages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-orange-600">Admin</Link><span>/</span>
        <span className="text-gray-800">Recipes</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recipes ({total.toLocaleString()})</h1>
      </div>
      <form method="GET" className="mb-6">
        <div className="flex gap-3">
          <input name="search" defaultValue={search} placeholder="Search recipes…"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700">Search</button>
          {search && <a href="/admin/recipes" className="px-4 py-2 text-sm text-gray-500">Clear</a>}
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-medium uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Recipe</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Views</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((recipe) => (
              <tr key={recipe.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/recipes/${recipe.id}`} className="font-medium text-gray-900 hover:text-orange-600 line-clamp-1 max-w-[200px] block">{recipe.title}</Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{recipe.category?.name}</td>
                <td className="px-4 py-3 text-gray-600">{recipe.author?.name}</td>
                <td className="px-4 py-3 text-gray-600">{recipe.views.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${recipe.isPublished ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {recipe.isPublished ? "Published" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(recipe.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <AdminRecipeActions recipeId={recipe.id} isPublished={recipe.isPublished} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Suspense><Pagination page={page} pages={pages} total={total} /></Suspense>
    </div>
  );
}
