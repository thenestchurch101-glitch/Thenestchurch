import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
  totalItems: number;
};

const buildHref = ({
  page,
  pathname,
  searchParams,
}: {
  page: number;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
}) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
};

export function AdminPagination({
  currentPage,
  pageSize,
  pathname,
  searchParams,
  totalItems,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) {
    return null;
  }

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "space-between",
      }}
    >
      <span style={{ color: "#6f675d", fontSize: "0.92rem" }}>{`Page ${currentPage} of ${totalPages} | ${totalItems} total`}</span>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {currentPage > 1 ? (
          <Link
            href={buildHref({
              page: currentPage - 1,
              pathname,
              searchParams,
            })}
            style={{
              border: "1px solid rgba(23,23,23,0.12)",
              borderRadius: "999px",
              color: "#171717",
              minHeight: "38px",
              padding: "8px 14px",
              textDecoration: "none",
            }}
          >
            Previous
          </Link>
        ) : null}

        {pages.map((page) => (
          <Link
            href={buildHref({
              page,
              pathname,
              searchParams,
            })}
            key={page}
            style={{
              background: page === currentPage ? "#171717" : "transparent",
              border: "1px solid rgba(23,23,23,0.12)",
              borderRadius: "999px",
              color: page === currentPage ? "#fffaf2" : "#171717",
              minHeight: "38px",
              padding: "8px 14px",
              textDecoration: "none",
            }}
          >
            {page}
          </Link>
        ))}

        {currentPage < totalPages ? (
          <Link
            href={buildHref({
              page: currentPage + 1,
              pathname,
              searchParams,
            })}
            style={{
              border: "1px solid rgba(23,23,23,0.12)",
              borderRadius: "999px",
              color: "#171717",
              minHeight: "38px",
              padding: "8px 14px",
              textDecoration: "none",
            }}
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
