"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserActions({ userId, currentRole, currentUserId }: { userId: number; currentRole: string; currentUserId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isSelf = userId === currentUserId;

  const toggleRole = async () => {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: currentRole === "admin" ? "user" : "admin" }),
    });
    setLoading(false);
    router.refresh();
  };

  const deleteUser = async () => {
    if (!confirm("Delete this user?")) return;
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex justify-end gap-2">
      {!isSelf && (
        <>
          <button onClick={toggleRole} disabled={loading}
            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors disabled:opacity-40">
            {currentRole === "admin" ? "Make User" : "Make Admin"}
          </button>
          <button onClick={deleteUser} disabled={loading}
            className="text-xs px-2.5 py-1 rounded-lg border border-red-100 hover:border-red-300 hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors disabled:opacity-40">
            Delete
          </button>
        </>
      )}
      {isSelf && <span className="text-xs text-gray-400">You</span>}
    </div>
  );
}
