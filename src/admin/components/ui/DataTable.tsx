import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, Search, Download } from 'lucide-react';
import { SkeletonTable } from './SkeletonLoader';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  actions?: (item: T) => React.ReactNode;
  title?: string;
  exportEnabled?: boolean;
  onExport?: () => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  totalItems = 0,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  onSearch,
  onSort,
  actions,
  title,
  exportEnabled = false,
  onExport,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleSort = (key: string) => {
    const isAsc = sortKey === key && sortDirection === 'asc';
    const direction = isAsc ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(direction);
    if (onSort) {
      onSort(key, direction);
    }
  };

  const handleExportClick = () => {
    if (onExport) {
      onExport();
      return;
    }
    if (!data || !data.length) return;
    const keys = columns.map(c => typeof c.key === 'string' ? c.key : String(c.key));
    const headers = columns.map(c => c.header).join(';');
    const rows = data.map(item => {
      return keys.map(k => {
        const val = item[k];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(';');
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `export_${title ? title.toLowerCase().replace(/\s+/g, '_') : 'saas'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  return (
    <div style={styles.container}>
      {/* Table Controls (Search, title, export) */}
      {(title || onSearch || exportEnabled) && (
        <div style={styles.controlsRow}>
          {title && <h3 style={styles.tableTitle}>{title}</h3>}
          <div style={styles.rightControls}>
            {onSearch && (
              <div style={styles.searchWrapper}>
                <Search size={14} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  style={styles.searchInput}
                />
              </div>
            )}
            {exportEnabled && (
              <button onClick={handleExportClick} style={styles.exportBtn}>
                <Download size={14} />
                Exporter CSV
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div style={styles.tableWrapper}>
        {loading ? (
          <SkeletonTable rows={itemsPerPage} cols={columns.length + (actions ? 1 : 0)} />
        ) : data.length === 0 ? (
          <div style={styles.emptyState}>Aucun élément trouvé.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    style={{
                      ...styles.th,
                      cursor: col.sortable ? 'pointer' : 'default',
                    }}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <div style={styles.thContent}>
                      {col.header}
                      {col.sortable && <ArrowUpDown size={12} style={styles.sortIcon} />}
                    </div>
                  </th>
                ))}
                {actions && <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id || index} className="admin-table-row" style={styles.row}>
                  {columns.map((col) => (
                    <td key={String(col.key)} style={styles.td}>
                      {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                  {actions && <td style={{ ...styles.td, textAlign: 'right' }}>{actions(item)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {onPageChange && totalItems > itemsPerPage && (
        <div style={styles.paginationRow}>
          <div style={styles.paginationInfo}>
            Affichage de {(currentPage - 1) * itemsPerPage + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} lignes
          </div>
          <div style={styles.paginationControls}>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...styles.pageBtn,
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={styles.pageIndicator}>
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...styles.pageBtn,
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'var(--admin-card-bg, #FFFFFF)',
    border: '1px solid var(--admin-card-border, #E2E8F0)',
    borderRadius: 14,
    boxShadow: 'var(--admin-card-shadow, 0 4px 20px rgba(0, 0, 0, 0.03))',
    overflow: 'hidden',
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--admin-card-border, #E2E8F0)',
    flexWrap: 'wrap',
    gap: 12,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: 'var(--admin-text-main, #0F172A)',
    margin: 0,
  },
  rightControls: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  searchWrapper: {
    position: 'relative',
    width: 200,
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--admin-text-muted, #94A3B8)',
  },
  searchInput: {
    width: '100%',
    background: 'var(--admin-input-bg, #F8FAFC)',
    border: '1px solid var(--admin-card-border, #E2E8F0)',
    borderRadius: 8,
    padding: '6px 10px 6px 30px',
    color: 'var(--admin-text-main, #0F172A)',
    fontSize: 12,
    outline: 'none',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: 'var(--admin-card-bg, #FFFFFF)',
    border: '1px solid var(--admin-card-border, #E2E8F0)',
    borderRadius: 8,
    color: 'var(--admin-text-sub, #64748B)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  headerRow: {
    borderBottom: '1px solid var(--admin-card-border, #E2E8F0)',
    background: 'var(--admin-header-row-bg, #F1F5F9)',
  },
  th: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--admin-text-sub, #64748B)',
    padding: '12px 20px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  sortIcon: {
    color: 'var(--admin-text-muted, #94A3B8)',
  },
  row: {
    borderBottom: '1px solid var(--admin-card-border, #F1F5F9)',
    transition: 'background 0.2s',
  },
  td: {
    padding: '14px 20px',
    fontSize: 13,
    color: 'var(--admin-text-main, #0F172A)',
    verticalAlign: 'middle',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: 'var(--admin-text-sub, #64748B)',
    fontSize: 13,
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderTop: '1px solid var(--admin-card-border, #E2E8F0)',
    background: 'var(--admin-header-row-bg, #F1F5F9)',
    flexWrap: 'wrap',
    gap: 12,
  },
  paginationInfo: {
    fontSize: 12,
    color: 'var(--admin-text-sub, #64748B)',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  pageBtn: {
    background: 'var(--admin-card-bg, #FFFFFF)',
    border: '1px solid var(--admin-card-border, #E2E8F0)',
    borderRadius: 6,
    color: 'var(--admin-text-sub, #64748B)',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicator: {
    fontSize: 12,
    color: 'var(--admin-text-main, #0F172A)',
    fontWeight: 600,
  },
};
