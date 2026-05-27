export default function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-100" />

      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded-full w-3/4" />
        {/* Description line 1 */}
        <div className="h-3.5 bg-gray-100 rounded-full w-full" />
        {/* Description line 2 */}
        <div className="h-3.5 bg-gray-100 rounded-full w-5/6" />

        {/* Meta row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className="h-3 bg-gray-200 rounded-full w-16" />
            <div className="h-5 bg-gray-200 rounded-full w-14" />
          </div>
          <div className="h-3 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

/** Renders a grid of N skeleton cards */
export function RecipeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}
