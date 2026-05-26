import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { desc, count, ilike, or } from "drizzle-orm";
import Link from "next/link";
import AdminUserActions from "./AdminUserActions";
import { formatDate } from "@/lib/utils";
import Pagination from "@/components/Pagination";
import { Suspense } from "react";

interface Props { searchParams: Promise<{ page?: string; search?: string }> }

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const search = sp.search || "";
  const limit = 20;
  const offset = (page - 1) * limit;

  const where = search ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)) : undefined;

  const [totalRes, data] = await Promise.all([
    db.select({ count: count() }).from(users).where(where),
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
      .from(users).where(where).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
  ]);

  const total = Number(totalRes[0]?.count ?? 0);
  const pages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-orange-600">Admin</Link><span>/</span>
        <span className="text-gray-800">Users</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users ({total.toLocaleString()})</h1>
      </div>
      <form method="GET" className="mb-6">
        <div className="flex gap-3">
          <input name="search" defaultValue={search} placeholder="Search by name or email…"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700">Search</button>
          {search && <a href="/admin/users" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</a>}
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-medium uppercase">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold text-xs">
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <AdminUserActions userId={user.id} currentRole={user.role} currentUserId={session.userId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Suspense><Pagination page={page} pages={pages} total={total} /></Suspense>
    </div>
  );
}
