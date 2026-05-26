"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ recipeId }: { recipeId: number }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId, rating, comment }),
    });
    setLoading(false);
    setSubmitted(true);
    router.refresh();
  };

  if (submitted) return <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm font-medium">Thank you for your review!</div>;

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Leave a Review</h3>
      <div className="mb-4">
        <label className="text-sm text-gray-600 mb-2 block">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}
              className={`text-2xl transition-transform hover:scale-110 ${n <= rating ? "text-yellow-400" : "text-gray-300"}`}>★</button>
          ))}
        </div>
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts..." rows={3}
        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-400 resize-none mb-3" />
      <button type="submit" disabled={loading}
        className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 font-medium text-sm disabled:opacity-50 transition-colors">
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
