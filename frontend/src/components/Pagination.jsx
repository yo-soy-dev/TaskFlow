import React from 'react';

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  const safePage = Number(page) || 1;
  const safePages = Number(pages) || 1;
  const safeTotal = Number(total) || 0;
  const safeLimit = Number(limit) || 20;

  if (safePages <= 1) return null;

  const getPages = () => {
    const arr = [];
    const delta = 2;
    for (let i = Math.max(1, safePage - delta); i <= Math.min(safePages, safePage + delta); i++) {
      arr.push(i);
    }
    if (arr[0] > 1) { arr.unshift('...'); arr.unshift(1); }
    if (arr[arr.length - 1] < safePages) { arr.push('...'); arr.push(safePages); }
    return arr;
  };

  const from = (safePage - 1) * safeLimit + 1;
  const to = Math.min(safePage * safeLimit, safeTotal);

  return (
    <div className="flex items-center justify-between mt-4" style={{ flexWrap: 'wrap', gap: 12 }}>
      <span className="text-sm text-muted">
        Showing {from}–{to} of {safeTotal} results
      </span>
      <div className="pagination">
        <button
          className="page-btn"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
        >‹</button>
        {getPages().map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className="text-muted" style={{ padding: '0 4px' }}>…</span>
            : <button
                key={p}
                className={`page-btn ${p === safePage ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >{p}</button>
        )}
        <button
          className="page-btn"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safePages}
        >›</button>
      </div>
    </div>
  );
};

export default Pagination;
