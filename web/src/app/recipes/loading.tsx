import { RecipeGridSkeleton } from "@/components/RecipeCardSkeleton";

export default function RecipesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-full w-40" />
          <div className="h-4 bg-gray-100 rounded-full w-32" />
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-32" />
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 flex flex-wrap gap-3 animate-pulse shadow-sm">
        <div className="flex-1 min-w-[200px] h-10 bg-gray-100 rounded-lg" />
        <div className="w-40 h-10 bg-gray-100 rounded-lg" />
        <div className="w-36 h-10 bg-gray-100 rounded-lg" />
        <div className="w-20 h-10 bg-orange-100 rounded-lg" />
      </div>

      <RecipeGridSkeleton count={12} />
    </div>
  );
}
