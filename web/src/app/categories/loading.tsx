export default function CategoriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Heading */}
      <div className="h-9 bg-gray-200 rounded-full w-56 mb-2" />
      <div className="h-5 bg-gray-100 rounded-full w-80 mb-10" />

      {/* Category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <div className="h-12 w-12 bg-gray-200 rounded-xl mx-auto" />
            <div className="h-5 bg-gray-200 rounded-full w-2/3 mx-auto" />
            <div className="h-4 bg-gray-100 rounded-full w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
