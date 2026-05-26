import Link from "next/link";

export default function AboutPage() {
  const features = [
    { icon: "🍽️", title: "10,000+ Recipes", desc: "Discover a vast collection of recipes from cuisines around the world." },
    { icon: "👨‍🍳", title: "Community Chefs", desc: "Connect with food enthusiasts and learn from passionate home cooks." },
    { icon: "⭐", title: "Ratings & Reviews", desc: "Rate recipes and read honest reviews from the community." },
    { icon: "❤️", title: "Save Favorites", desc: "Build your personal collection of go-to recipes." },
    { icon: "🔍", title: "Smart Search", desc: "Find recipes by name, category, difficulty, or cooking time." },
    { icon: "📱", title: "Mobile App", desc: "Take RecipeVault wherever you go with our React Native app." },
  ];

  const stack = [
    { name: "Next.js 15", desc: "Full-stack React framework" },
    { name: "TypeScript", desc: "Type-safe development" },
    { name: "Tailwind CSS", desc: "Utility-first styling" },
    { name: "Drizzle ORM", desc: "Type-safe database queries" },
    { name: "Neon PostgreSQL", desc: "Serverless database" },
    { name: "Expo / React Native", desc: "Mobile application" },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">About RecipeVault</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your ultimate destination for discovering, sharing, and mastering recipes from cuisines around the world.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Built With Modern Tech</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stack.map((s) => (
              <div key={s.name} className="bg-gray-800 rounded-2xl p-4">
                <div className="font-semibold text-orange-400">{s.name}</div>
                <div className="text-sm text-gray-400 mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Cooking?</h2>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">Join our community of food lovers and start sharing your culinary creations today.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/register" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">Get Started</Link>
          <Link href="/recipes" className="border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Browse Recipes</Link>
        </div>
      </section>
    </div>
  );
}
