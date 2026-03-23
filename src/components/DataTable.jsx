import React, { useState } from 'react';
import './DataTable.css';

export default function DataTable({ columns, data, loading, emptyIcon = '📋', emptyText = 'No data found' }) {
  const [search, setSearch] = useState('');

  const filtered = (data || []).filter((row) =>
    Object.values(row).some((v) =>
      String(v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="data-table-wrap">
      <div className="data-table-search">
        <div className="search-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          className="search-input"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length}>
                <div className="table-loading">
                  <div className="spinner" />
                  <span>Loading...</span>
                </div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={columns.length}>
                <div className="table-empty">
                  <div className="empty-icon">{emptyIcon}</div>
                  <div className="empty-text">{emptyText}</div>
                </div>
              </td></tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="table-footer">
          {filtered.length} {filtered.length !== (data || []).length ? `of ${data.length} ` : ''}
          record{filtered.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
