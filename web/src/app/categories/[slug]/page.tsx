import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { categories, recipes, users } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import { Suspense } from "react";
import Pagination from "@/components/Pagination";

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category] = await db
    .select({ name: categories.name, description: categories.description })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!category) return { title: "Category — RecipeVault" };

  return {
    title: `${category.name} Recipes — RecipeVault`,
    description: category.description
      ? `${category.description} Browse ${category.name} recipes on RecipeVault.`
      : `Browse the best ${category.name} recipes on RecipeVault.`,
    openGraph: {
      title: `${category.name} Recipes — RecipeVault`,
      description: `Discover and share ${category.name} recipes on RecipeVault.`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1"));
  const limit = 12;
  const offset = (page - 1) * limit;

  const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (!category) notFound();

  const [totalRes, data] = await Promise.all([
    db.select({ count: count() }).from(recipes).where(eq(recipes.categoryId, category.id)),
    db.select({
      id: recipes.id, title: recipes.title, description: recipes.description, imageUrl: recipes.imageUrl,
      prepTime: recipes.prepTime, cookTime: recipes.cookTime, difficulty: recipes.difficulty,
      category: { id: categories.id, name: categories.name, slug: categories.slug },
      author: { id: users.id, name: users.name },
    })
      .from(recipes)
      .leftJoin(users, eq(recipes.userId, users.id))
      .leftJoin(categories, eq(recipes.categoryId, categories.id))
      .where(eq(recipes.categoryId, category.id))
      .orderBy(desc(recipes.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(totalRes[0]?.count ?? 0);
  const pages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-600">Home</Link><span>/</span>
        <Link href="/categories" className="hover:text-orange-600">Categories</Link><span>/</span>
        <span className="text-gray-800">{category.name}</span>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name} Recipes</h1>
        {category.description && <p className="text-gray-500 mt-2">{category.description}</p>}
        <p className="text-sm text-gray-400 mt-1">{total.toLocaleString()} recipes</p>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><div className="text-6xl mb-4">🍽️</div><p>No recipes in this category yet.</p></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map((r) => <RecipeCard key={r.id} {...r} />)}
          </div>
          <Suspense><Pagination page={page} pages={pages} total={total} /></Suspense>
        </>
      )}
    </div>
  );
}
