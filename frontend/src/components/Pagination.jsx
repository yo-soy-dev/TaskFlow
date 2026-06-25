import React from 'react';

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null;

  const getPages = () => {
    const arr = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      arr.push(i);
    }
    if (arr[0] > 1) { arr.unshift('...'); arr.unshift(1); }
    if (arr[arr.length - 1] < pages) { arr.push('...'); arr.push(pages); }
    return arr;
  };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-4" style={{ flexWrap: 'wrap', gap: 12 }}>
      <span className="text-sm text-muted">Showing {from}–{to} of {total} results</span>
      <div className="pagination">
        <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>‹</button>
        {getPages().map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className="text-muted" style={{ padding: '0 4px' }}>…</span>
            : <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        )}
        <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page >= pages}>›</button>
      </div>
    </div>
  );
};

export default Pagination;