"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRecipeActions({ recipeId, isPublished }: { recipeId: number; isPublished: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    await fetch("/api/admin/recipes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId, isPublished: !isPublished }),
    });
    setLoading(false);
    router.refresh();
  };

  const del = async () => {
    if (!confirm("Delete this recipe?")) return;
    setLoading(true);
    await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex justify-end gap-2">
      <button onClick={toggle} disabled={loading}
        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-40 ${isPublished ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>
        {isPublished ? "Hide" : "Publish"}
      </button>
      <button onClick={del} disabled={loading}
        className="text-xs px-2.5 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40">
        Delete
      </button>
    </div>
  );
}
