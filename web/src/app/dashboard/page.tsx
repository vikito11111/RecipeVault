import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Dashboard — RecipeVault",
  description: "Manage your recipes, view your favorites, and track your activity on RecipeVault.",
  robots: { index: false, follow: false },
};
import { db } from "@/db";
import { recipes, favorites, reviews, categories, users } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import RecipeCard from "@/components/RecipeCard";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [user] = await db.select({
    id: users.id, name: users.name, email: users.email, bio: users.bio, createdAt: users.createdAt,
  }).from(users).where(eq(users.id, session.userId)).limit(1);

  const [myRecipes, myFavorites, myReviewCount] = await Promise.all([
    db.select({
      id: recipes.id, title: recipes.title, description: recipes.description, imageUrl: recipes.imageUrl,
      prepTime: recipes.prepTime, cookTime: recipes.cookTime, difficulty: recipes.difficulty, views: recipes.views,
      category: { id: categories.id, name: categories.name, slug: categories.slug },
      author: { id: users.id, name: users.name },
    })
      .from(recipes)
      .leftJoin(categories, eq(recipes.categoryId, categories.id))
      .leftJoin(users, eq(recipes.userId, users.id))
      .where(eq(recipes.userId, session.userId))
      .orderBy(desc(recipes.createdAt))
      .limit(8),
    db.select({ count: count() }).from(favorites).where(eq(favorites.userId, session.userId)),
    db.select({ count: count() }).from(reviews).where(eq(reviews.userId, session.userId)),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <Link href="/recipes/new" className="bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 font-medium text-sm self-start">+ New Recipe</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "My Recipes", value: myRecipes.length, icon: "📖", href: null },
          { label: "Favorites", value: Number(myFavorites[0]?.count), icon: "♥", href: "/dashboard/favorites" },
          { label: "Reviews", value: Number(myReviewCount[0]?.count), icon: "⭐", href: null },
          { label: "Member since", value: formatDate(user?.createdAt!).split(",")[0], icon: "📅", href: null },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* My Recipes */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">My Recipes</h2>
          <Link href="/recipes/new" className="text-orange-600 text-sm hover:text-orange-700 font-medium">+ Add new</Link>
        </div>
        {myRecipes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <div className="text-4xl mb-3">🍳</div>
            <p className="text-gray-500 mb-4">You haven&apos;t shared any recipes yet.</p>
            <Link href="/recipes/new" className="bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 font-medium text-sm">Create your first recipe</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {myRecipes.map((r) => <RecipeCard key={r.id} {...r} />)}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link href="/profile" className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-sm">Edit Profile</Link>
        <Link href="/dashboard/favorites" className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-sm">View Favorites</Link>
      </div>
    </div>
  );
}
