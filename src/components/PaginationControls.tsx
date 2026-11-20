import Link from "next/link";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string | undefined>;
}

function buildPageHref(
  basePath: string,
  page: number,
  queryParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  if (queryParams) {
    for (const [k, v] of Object.entries(queryParams)) {
      if (v) params.set(k, v);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function PaginationControls({
  currentPage,
  totalPages,
  basePath,
  queryParams,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="pt-4 flex items-center justify-between gap-3 border-t border-[#E5E5E5]"
    >
      <span className="font-mono text-[12px] text-[#5F6368]">
        Page {currentPage} of {totalPages}
      </span>

      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={buildPageHref(basePath, currentPage - 1, queryParams)}
            className="h-9 px-4 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[13px] font-medium text-[#1A1A1A] inline-flex items-center hover:bg-[#F4F3EF]"
          >
            ← Previous
          </Link>
        ) : (
          <span className="h-9 px-4 rounded-full border border-[#E5E5E5] text-[13px] font-medium text-[#5F6368] opacity-45 inline-flex items-center">
            ← Previous
          </span>
        )}

        {hasNext ? (
          <Link
            href={buildPageHref(basePath, currentPage + 1, queryParams)}
            className="h-9 px-4 rounded-full border border-[#E5E5E5] bg-[#FFFFFF] text-[13px] font-medium text-[#1A1A1A] inline-flex items-center hover:bg-[#F4F3EF]"
          >
            Next →
          </Link>
        ) : (
          <span className="h-9 px-4 rounded-full border border-[#E5E5E5] text-[13px] font-medium text-[#5F6368] opacity-45 inline-flex items-center">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}
