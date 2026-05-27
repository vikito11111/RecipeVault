import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard — RecipeVault",
  description: "Admin panel for managing RecipeVault users, recipes, and platform statistics.",
  robots: { index: false, follow: false },
};
import { db } from "@/db";
import { users, recipes, reviews, categories, favorites } from "@/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const [
    [userCount],
    [recipeCount],
    [reviewCount],
    [categoryCount],
    [favoriteCount],
    [publishedCount],
    recentUsers,
    recentRecipes,
    topRecipes,
    categoryStats,
    difficultyStats,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(recipes),
    db.select({ count: count() }).from(reviews),
    db.select({ count: count() }).from(categories),
    db.select({ count: count() }).from(favorites),
    db.select({ count: count() }).from(recipes).where(eq(recipes.isPublished, true)),
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
      .from(users).orderBy(desc(users.createdAt)).limit(5),
    db.select({ id: recipes.id, title: recipes.title, createdAt: recipes.createdAt, isPublished: recipes.isPublished })
      .from(recipes).orderBy(desc(recipes.createdAt)).limit(5),
    db.select({ id: recipes.id, title: recipes.title, views: recipes.views })
      .from(recipes).where(eq(recipes.isPublished, true)).orderBy(desc(recipes.views)).limit(5),
    db.select({ name: categories.name, slug: categories.slug, recipeCount: count(recipes.id) })
      .from(categories)
      .leftJoin(recipes, eq(categories.id, recipes.categoryId))
      .groupBy(categories.id, categories.name, categories.slug)
      .orderBy(desc(count(recipes.id)))
      .limit(5),
    db.select({ difficulty: recipes.difficulty, count: count() })
      .from(recipes)
      .groupBy(recipes.difficulty),
  ]);

  const totalRecipes = Number(recipeCount.count);
  const totalUsers = Number(userCount.count);

  const summaryStats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: "👥", href: "/admin/users", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "Total Recipes", value: totalRecipes.toLocaleString(), icon: "📖", href: "/admin/recipes", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { label: "Published", value: Number(publishedCount.count).toLocaleString(), icon: "✅", href: "/admin/recipes", color: "bg-green-50 text-green-700 border-green-200" },
    { label: "Total Reviews", value: Number(reviewCount.count).toLocaleString(), icon: "⭐", href: null, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { label: "Favorites", value: Number(favoriteCount.count).toLocaleString(), icon: "❤️", href: null, color: "bg-pink-50 text-pink-700 border-pink-200" },
    { label: "Categories", value: Number(categoryCount.count).toLocaleString(), icon: "🏷️", href: null, color: "bg-purple-50 text-purple-700 border-purple-200" },
  ];

  const difficultyMap: Record<string, { label: string; color: string }> = {
    easy: { label: "Easy", color: "bg-green-100 text-green-700" },
    medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
    hard: { label: "Hard", color: "bg-red-100 text-red-700" },
  };

  function formatDate(d: Date) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded">ADMIN</span>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {summaryStats.map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color}`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium mt-0.5 opacity-80">{stat.label}</div>
            {stat.href && (
              <Link href={stat.href} className="text-xs mt-2 inline-block underline opacity-60 hover:opacity-100">
                Manage →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* Difficulty breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipes by Difficulty</h2>
          <div className="space-y-3">
            {difficultyStats.map((d) => {
              const pct = totalRecipes > 0 ? Math.round((Number(d.count) / totalRecipes) * 100) : 0;
              const info = difficultyMap[d.difficulty] ?? { label: d.difficulty, color: "bg-gray-100 text-gray-700" };
              return (
                <div key={d.difficulty}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${info.color}`}>{info.label}</span>
                    <span className="text-gray-500">{Number(d.count).toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        d.difficulty === "easy" ? "bg-green-400" : d.difficulty === "medium" ? "bg-yellow-400" : "bg-red-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top categories */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories by Recipes</h2>
          <div className="space-y-3">
            {categoryStats.map((cat, i) => {
              const pct = totalRecipes > 0 ? Math.round((Number(cat.recipeCount) / totalRecipes) * 100) : 0;
              return (
                <div key={cat.slug}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      <span className="text-gray-400 mr-2">#{i + 1}</span>
                      {cat.name}
                    </span>
                    <span className="text-gray-500">{Number(cat.recipeCount).toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top recipes by views */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Recipes by Views</h2>
            <Link href="/admin/recipes" className="text-xs text-orange-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topRecipes.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5">
                <span className="text-lg font-bold text-gray-300 w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <Link href={`/recipes/${r.id}`} className="text-sm font-medium text-gray-800 hover:text-orange-600 truncate block">
                    {r.title}
                  </Link>
                </div>
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  👁 {Number(r.views).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent recipes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recently Added Recipes</h2>
            <Link href="/admin/recipes" className="text-xs text-orange-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentRecipes.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <Link href={`/recipes/${r.id}`} className="text-sm font-medium text-gray-800 hover:text-orange-600 truncate block">
                    {r.title}
                  </Link>
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {r.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recently Joined Users</h2>
          <Link href="/admin/users" className="text-xs text-orange-600 hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold text-xs flex-shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-500 truncate max-w-[180px]">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/users" className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-3">👥</div>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">Manage Users</h2>
          <p className="text-sm text-gray-500 mt-1">View, search and manage user accounts and roles</p>
        </Link>
        <Link href="/admin/recipes" className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-3">📖</div>
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">Manage Recipes</h2>
          <p className="text-sm text-gray-500 mt-1">View, search and moderate recipe submissions</p>
        </Link>
      </div>
    </div>
  );
}
