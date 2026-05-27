import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { recipes, categories, users, reviews, favorites } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import ReviewForm from "./ReviewForm";
import FavoriteButton from "./FavoriteButton";
import { formatDate } from "@/lib/utils";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipeId = parseInt(id);
  if (isNaN(recipeId)) return { title: "Recipe — RecipeVault" };

  const [recipe] = await db
    .select({ title: recipes.title, description: recipes.description, imageUrl: recipes.imageUrl })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) return { title: "Recipe Not Found — RecipeVault" };

  return {
    title: `${recipe.title} — RecipeVault`,
    description: recipe.description?.slice(0, 160),
    openGraph: {
      title: recipe.title,
      description: recipe.description?.slice(0, 160),
      images: recipe.imageUrl ? [{ url: recipe.imageUrl }] : [],
      type: "article",
    },
  };
}

const difficultyColor = { easy: "bg-green-100 text-green-700", medium: "bg-yellow-100 text-yellow-700", hard: "bg-red-100 text-red-700" };

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const recipeId = parseInt(id);
  if (isNaN(recipeId)) notFound();

  const session = await getSession();

  const [recipe] = await db.select({
    id: recipes.id, title: recipes.title, description: recipes.description,
    ingredients: recipes.ingredients, instructions: recipes.instructions,
    imageUrl: recipes.imageUrl, prepTime: recipes.prepTime, cookTime: recipes.cookTime,
    servings: recipes.servings, difficulty: recipes.difficulty, views: recipes.views,
    isPublished: recipes.isPublished, createdAt: recipes.createdAt, userId: recipes.userId,
    category: { id: categories.id, name: categories.name, slug: categories.slug },
    author: { id: users.id, name: users.name, bio: users.bio, avatarUrl: users.avatarUrl },
  })
    .from(recipes)
    .leftJoin(categories, eq(recipes.categoryId, categories.id))
    .leftJoin(users, eq(recipes.userId, users.id))
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (!recipe) notFound();

  await db.update(recipes).set({ views: sql`${recipes.views} + 1` }).where(eq(recipes.id, recipeId));

  const recipeReviews = await db.select({
    id: reviews.id, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt,
    author: { id: users.id, name: users.name },
  })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.recipeId, recipeId))
    .limit(30);

  const avgRating = recipeReviews.length > 0
    ? recipeReviews.reduce((s, r) => s + r.rating, 0) / recipeReviews.length
    : 0;

  let isFavorited = false;
  if (session) {
    const fav = await db.select().from(favorites)
      .where(eq(favorites.recipeId, recipeId))
      .limit(1);
    isFavorited = fav.some(f => f.userId === session.userId);
  }

  const ingredientsList = recipe.ingredients.split("\n").filter(Boolean);
  const instructionsList = recipe.instructions.split("\n").filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb — scrollable on small screens */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
        <Link href="/" className="hover:text-orange-600 flex-shrink-0">Home</Link>
        <span className="flex-shrink-0">/</span>
        <Link href="/recipes" className="hover:text-orange-600 flex-shrink-0">Recipes</Link>
        {recipe.category && (
          <>
            <span className="flex-shrink-0">/</span>
            <Link href={`/categories/${recipe.category.slug}`} className="hover:text-orange-600 flex-shrink-0">
              {recipe.category.name}
            </Link>
          </>
        )}
        <span className="flex-shrink-0">/</span>
        <span className="text-gray-800 truncate max-w-[140px] sm:max-w-[220px]">{recipe.title}</span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-64 sm:h-80 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-7xl">🍽️</div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              {recipe.category && <Link href={`/categories/${recipe.category.slug}`} className="text-orange-600 text-sm font-medium hover:text-orange-700">{recipe.category.name}</Link>}
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{recipe.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              {session && <FavoriteButton recipeId={recipeId} isFavorited={isFavorited} />}
              {session?.userId === recipe.userId && (
                <Link href={`/recipes/${recipeId}/edit`} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Edit</Link>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-lg mb-6">{recipe.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-orange-50 rounded-2xl">
            <div className="text-center"><div className="text-2xl font-bold text-orange-600">{recipe.prepTime}m</div><div className="text-xs text-gray-500 mt-1">Prep Time</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-orange-600">{recipe.cookTime}m</div><div className="text-xs text-gray-500 mt-1">Cook Time</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-orange-600">{recipe.servings}</div><div className="text-xs text-gray-500 mt-1">Servings</div></div>
            <div className="text-center">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize mt-1 ${difficultyColor[recipe.difficulty as keyof typeof difficultyColor]}`}>{recipe.difficulty}</div>
              <div className="text-xs text-gray-500 mt-1">Difficulty</div>
            </div>
          </div>

          {avgRating > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</div>
              <span className="text-sm font-medium text-gray-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({recipeReviews.length} reviews)</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {ingredientsList.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
              <ol className="space-y-4">
                {instructionsList.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-gray-700 leading-relaxed">{step.replace(/^\d+\.\s*/, "")}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {recipe.author && (
            <div className="border-t border-gray-100 pt-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold">
                  {recipe.author.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Recipe by</div>
                  <div className="font-semibold text-gray-900">{recipe.author.name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews ({recipeReviews.length})</h2>
        {session && <ReviewForm recipeId={recipeId} />}
        <div className="space-y-4 mt-6">
          {recipeReviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold text-sm flex-shrink-0">
                    {r.author?.name[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{r.author?.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-yellow-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
              </div>
              {r.comment && <p className="text-gray-600 mt-2">{r.comment}</p>}
            </div>
          ))}
          {recipeReviews.length === 0 && !session && (
            <p className="text-gray-400 text-center py-8"><Link href="/auth/login" className="text-orange-600">Login</Link> to be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
}
