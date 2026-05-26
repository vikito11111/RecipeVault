"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category { id: number; name: string }
interface Recipe {
  id: number; title: string; description: string; ingredients: string;
  instructions: string; categoryId: number; imageUrl?: string | null;
  prepTime: number; cookTime: number; servings: number; difficulty: string;
}

export default function RecipeForm({ categories, recipe }: { categories: Category[]; recipe?: Recipe }) {
  const router = useRouter();
  const isEdit = !!recipe;
  const [form, setForm] = useState({
    title: recipe?.title || "",
    description: recipe?.description || "",
    ingredients: recipe?.ingredients || "",
    instructions: recipe?.instructions || "",
    categoryId: recipe?.categoryId?.toString() || "",
    imageUrl: recipe?.imageUrl || "",
    prepTime: recipe?.prepTime?.toString() || "15",
    cookTime: recipe?.cookTime?.toString() || "30",
    servings: recipe?.servings?.toString() || "4",
    difficulty: recipe?.difficulty || "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description || !form.ingredients || !form.instructions || !form.categoryId) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const url = isEdit ? `/api/recipes/${recipe!.id}` : "/api/recipes";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, categoryId: parseInt(form.categoryId) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed to save recipe."); return; }
    router.push(`/recipes/${isEdit ? recipe!.id : data.recipe.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Recipe title" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Brief description" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
        <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients * (one per line)</label>
        <textarea name="ingredients" value={form.ingredients} onChange={handleChange} rows={6} placeholder={"2 cups flour\n1 cup milk\n3 eggs"} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none font-mono" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions * (one step per line)</label>
        <textarea name="instructions" value={form.instructions} onChange={handleChange} rows={8} placeholder={"1. Preheat oven to 350°F\n2. Mix dry ingredients"} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prep (min)</label>
          <input name="prepTime" type="number" min={0} value={form.prepTime} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cook (min)</label>
          <input name="cookTime" type="number" min={0} value={form.cookTime} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
          <input name="servings" type="number" min={1} value={form.servings} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors">
          {loading ? "Saving…" : isEdit ? "Update Recipe" : "Publish Recipe"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-100 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
      </div>
    </form>
  );
}
