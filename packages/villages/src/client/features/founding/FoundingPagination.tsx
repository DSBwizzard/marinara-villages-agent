export function FoundingPagination({
  page,
  count,
  onPage,
  label,
}: {
  page: number;
  count: number;
  onPage(page: number): void;
  label: string;
}) {
  if (count <= 1) return null;
  return (
    <nav className="villages-founding-pagination" aria-label={`${label} pages`}>
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPage(page - 1)}
        aria-label={`Previous ${label} page`}
      >
        Previous
      </button>
      <span aria-live="polite">
        {page + 1} / {count}
      </span>
      <button
        type="button"
        disabled={page >= count - 1}
        onClick={() => onPage(page + 1)}
        aria-label={`Next ${label} page`}
      >
        Next
      </button>
    </nav>
  );
}
