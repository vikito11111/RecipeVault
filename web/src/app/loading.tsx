import { RecipeGridSkeleton } from "@/components/RecipeCardSkeleton";

export default function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20 px-4 animate-pulse">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="h-14 bg-orange-100 rounded-full w-3/4 mx-auto" />
          <div className="h-6 bg-orange-50 rounded-full w-2/3 mx-auto" />
          <div className="flex gap-4 justify-center mt-6">
            <div className="h-14 w-40 bg-orange-200 rounded-xl" />
            <div className="h-14 w-40 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-full w-56 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-28 border border-gray-100" />
          ))}
        </div>
      </section>

      {/* Featured recipes skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-full w-44 mb-8" />
        <RecipeGridSkeleton count={8} />
      </section>
    </div>
  );
}
