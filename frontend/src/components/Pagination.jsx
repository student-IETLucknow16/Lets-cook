import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    // Keep the pager compact: current +/- 1, first, last
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <nav className="pagination" aria-label="Recipe pages">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      {pages.map((p, idx) => (
        <React.Fragment key={p}>
          {idx > 0 && p - pages[idx - 1] > 1 && <span className="pagination-ellipsis">…</span>}
          <button
            className={`pagination-btn ${p === page ? 'pagination-btn-active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        </React.Fragment>
      ))}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;
