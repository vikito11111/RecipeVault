"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.user && setUser(d.user))
      .catch(() => {});
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-orange-600">RecipeVault</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/recipes" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Recipes</Link>
            <Link href="/categories" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Categories</Link>
            <Link href="/about" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">About</Link>
            {user ? (
              <>
                <Link href="/recipes/new" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm">+ Add Recipe</Link>
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-gray-700 hover:text-orange-600">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold text-sm">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{user.name.split(" ")[0]}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">Dashboard</Link>
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">Profile</Link>
                      {user.role === "admin" && <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium">Admin Panel</Link>}
                      <hr className="my-1" />
                      <button onClick={() => { setMenuOpen(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-gray-600 hover:text-orange-600 font-medium">Login</Link>
                <Link href="/auth/register" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4 space-y-2">
            <Link href="/recipes" className="block py-2 text-gray-600 font-medium">Recipes</Link>
            <Link href="/categories" className="block py-2 text-gray-600 font-medium">Categories</Link>
            <Link href="/about" className="block py-2 text-gray-600 font-medium">About</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block py-2 text-gray-600 font-medium">Dashboard</Link>
                <Link href="/profile" className="block py-2 text-gray-600 font-medium">Profile</Link>
                {user.role === "admin" && <Link href="/admin" className="block py-2 text-orange-600 font-medium">Admin Panel</Link>}
                <button onClick={logout} className="block py-2 text-red-600 font-medium w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block py-2 text-gray-600 font-medium">Login</Link>
                <Link href="/auth/register" className="block py-2 text-orange-600 font-medium">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
