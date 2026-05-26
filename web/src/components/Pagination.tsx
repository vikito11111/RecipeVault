"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
}

export default function Pagination({ page, pages, total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pages <= 1) return null;

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pageNumbers = Array.from({ length: Math.min(5, pages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, pages - 4));
    return start + i;
  }).filter((p) => p >= 1 && p <= pages);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button disabled={page <= 1} onClick={() => goTo(page - 1)}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-orange-50 hover:border-orange-200 transition-colors">
        ← Prev
      </button>
      {pageNumbers[0] > 1 && <><button onClick={() => goTo(1)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-orange-50">1</button><span className="text-gray-400">…</span></>}
      {pageNumbers.map((p) => (
        <button key={p} onClick={() => goTo(p)}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${p === page ? "bg-orange-600 text-white border-orange-600" : "border-gray-200 hover:bg-orange-50 hover:border-orange-200"}`}>
          {p}
        </button>
      ))}
      {pageNumbers[pageNumbers.length - 1] < pages && <><span className="text-gray-400">…</span><button onClick={() => goTo(pages)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-orange-50">{pages}</button></>}
      <button disabled={page >= pages} onClick={() => goTo(page + 1)}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-orange-50 hover:border-orange-200 transition-colors">
        Next →
      </button>
    </div>
  );
}
