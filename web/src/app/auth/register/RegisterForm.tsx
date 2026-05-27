"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-orange-600">RecipeVault</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create an account</h1>
          <p className="text-gray-500 mt-1">Join the cooking community</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
