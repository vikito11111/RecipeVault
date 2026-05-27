import Link from "next/link";

const categoryLinks = [
  { href: "/categories/italian", label: "🍝 Italian" },
  { href: "/categories/asian", label: "🍜 Asian" },
  { href: "/categories/mexican", label: "🌮 Mexican" },
  { href: "/categories/desserts", label: "🍰 Desserts" },
  { href: "/categories/vegetarian", label: "🥗 Vegetarian" },
  { href: "/categories/american", label: "🍔 American" },
];

const exploreLinks = [
  { href: "/recipes", label: "All Recipes" },
  { href: "/categories", label: "Categories" },
  { href: "/recipes/new", label: "Add a Recipe" },
  { href: "/about", label: "About Us" },
];

const accountLinks = [
  { href: "/auth/register", label: "Create Account" },
  { href: "/auth/login", label: "Sign In" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/favorites", label: "My Favorites" },
  { href: "/profile", label: "Profile Settings" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-2xl font-extrabold text-white group-hover:text-orange-400 transition-colors">
                🍴 RecipeVault
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Discover, share, and save the best recipes from around the world.
              Join thousands of food lovers and bring flavour to every meal.
            </p>

            {/* Stats strip */}
            <div className="flex gap-6">
              <div>
                <div className="text-lg font-bold text-white">10K+</div>
                <div className="text-xs text-gray-500 mt-0.5">Recipes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">8</div>
                <div className="text-xs text-gray-500 mt-0.5">Categories</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">50+</div>
                <div className="text-xs text-gray-500 mt-0.5">Chefs</div>
              </div>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-orange-400 transition-colors hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2.5 text-sm">
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-orange-400 transition-colors hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {categoryLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-orange-400 transition-colors hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} RecipeVault. Built with Next.js, Drizzle ORM &amp; Neon PostgreSQL.</span>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-orange-400 transition-colors">About</Link>
            <span className="text-gray-700">·</span>
            <Link href="/recipes" className="hover:text-orange-400 transition-colors">Recipes</Link>
            <span className="text-gray-700">·</span>
            <Link href="/auth/register" className="hover:text-orange-400 transition-colors">Sign Up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
