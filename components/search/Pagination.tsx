"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export default function Pagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Generate page numbers
  const pages = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link 
          href={createPageURL(currentPage - 1)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-orange-500 transition-colors shadow-sm"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </Link>
      ) : (
        <button disabled className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed">
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="flex items-center justify-center w-10 h-10 text-neutral-400">
                <MoreHorizontal size={20} />
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <Link
              key={`page-${page}`}
              href={createPageURL(page)}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all font-semibold shadow-sm ${
                isCurrent 
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent" 
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-orange-500"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link 
          href={createPageURL(currentPage + 1)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-orange-500 transition-colors shadow-sm"
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </Link>
      ) : (
        <button disabled className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed">
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
