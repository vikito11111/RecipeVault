import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Big 404 */}
        <div className="text-[10rem] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-amber-600 select-none">
          404
        </div>

        {/* Icon */}
        <div className="text-7xl mb-6 -mt-4">🍽️</div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Looks like this recipe got lost in the kitchen. The page you&apos;re
          looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
          >
            ← Back to Home
          </Link>
          <Link
            href="/recipes"
            className="bg-white text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
          >
            Browse Recipes
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 bg-orange-50 rounded-2xl p-6 text-left">
          <p className="text-sm font-semibold text-orange-800 mb-3">
            Maybe you were looking for:
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/recipes" className="text-orange-600 hover:underline font-medium">
                🍴 All Recipes
              </Link>
            </li>
            <li>
              <Link href="/categories" className="text-orange-600 hover:underline font-medium">
                🏷️ Browse by Category
              </Link>
            </li>
            <li>
              <Link href="/auth/register" className="text-orange-600 hover:underline font-medium">
                👤 Create an Account
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-orange-600 hover:underline font-medium">
                ℹ️ About RecipeVault
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
