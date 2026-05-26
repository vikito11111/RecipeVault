import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-3">RecipeVault</h3>
            <p className="text-sm text-gray-400">Discover, share, and save your favorite recipes from around the world.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/recipes" className="hover:text-orange-400 transition-colors">All Recipes</Link></li>
              <li><Link href="/categories" className="hover:text-orange-400 transition-colors">Categories</Link></li>
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register" className="hover:text-orange-400 transition-colors">Sign Up</Link></li>
              <li><Link href="/auth/login" className="hover:text-orange-400 transition-colors">Login</Link></li>
              <li><Link href="/dashboard" className="hover:text-orange-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/categories/italian" className="hover:text-orange-400 transition-colors">Italian</Link></li>
              <li><Link href="/categories/asian" className="hover:text-orange-400 transition-colors">Asian</Link></li>
              <li><Link href="/categories/desserts" className="hover:text-orange-400 transition-colors">Desserts</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} RecipeVault. Built with Next.js, Drizzle ORM & Neon PostgreSQL.
        </div>
      </div>
    </footer>
  );
}
