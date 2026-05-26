"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface User { id: number; name: string; email: string; bio?: string | null; avatarUrl?: string | null }

export default function ProfileForm({ user }: { user: User }) {
  const [form, setForm] = useState({ name: user.name, bio: user.bio || "", avatarUrl: user.avatarUrl || "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess(false);
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setSuccess(true);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl text-orange-700 font-bold">
          {form.name[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">Profile updated!</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4} placeholder="Tell us about yourself..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
          <input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
            placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors">
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
