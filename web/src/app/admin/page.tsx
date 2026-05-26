import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { users, recipes, reviews, categories } from "@/db/schema";
import { count } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const [[userCount], [recipeCount], [reviewCount], [categoryCount]] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(recipes),
    db.select({ count: count() }).from(reviews),
    db.select({ count: count() }).from(categories),
  ]);

  const stats = [
    { label: "Total Users", value: Number(userCount.count).toLocaleString(), icon: "👥", href: "/admin/users", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Total Recipes", value: Number(recipeCount.count).toLocaleString(), icon: "📖", href: "/admin/recipes", color: "bg-orange-50 text-orange-600 border-orange-100" },
    { label: "Total Reviews", value: Number(reviewCount.count).toLocaleString(), icon: "⭐", href: null, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
    { label: "Categories", value: Number(categoryCount.count).toLocaleString(), icon: "🏷️", href: null, color: "bg-green-50 text-green-600 border-green-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded">ADMIN</span>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-5 ${stat.color}`}>
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm font-medium mt-1">{stat.label}</div>
            {stat.href && <Link href={stat.href} className="text-xs mt-2 inline-block underline opacity-70 hover:opacity-100">Manage →</Link>}
          </div>
        ))}
      </div>

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
