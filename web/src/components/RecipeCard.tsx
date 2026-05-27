import Link from "next/link";

interface RecipeCardProps {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  views?: number;
  category?: { name: string; slug: string } | null;
  author?: { name: string } | null;
}

const difficultyColor = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function RecipeCard({
  id, title, description, imageUrl, prepTime, cookTime, difficulty, views, category, author,
}: RecipeCardProps) {
  return (
    <Link
      href={`/recipes/${id}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl">🍽️</div>
        )}
        {category && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-1 rounded-full">
            {category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{description}</p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">⏱ {prepTime + cookTime} min</span>
            <span
              className={`px-2 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${
                difficultyColor[difficulty as keyof typeof difficultyColor] || "bg-gray-100 text-gray-600"
              }`}
            >
              {difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {views !== undefined && (
              <span className="text-gray-400 whitespace-nowrap">👁 {views.toLocaleString()}</span>
            )}
            {author && (
              <span className="text-gray-400 truncate max-w-[80px] sm:max-w-[100px]">
                by {author.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
