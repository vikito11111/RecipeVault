"use client";
import { useState } from "react";

export default function FavoriteButton({ recipeId, isFavorited: init }: { recipeId: number; isFavorited: boolean }) {
  const [fav, setFav] = useState(init);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId }),
    });
    const data = await res.json();
    setFav(data.favorited);
    setLoading(false);
  };

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${fav ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
      {fav ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
