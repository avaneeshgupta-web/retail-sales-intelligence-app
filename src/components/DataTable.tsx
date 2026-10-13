import React, { useState, useMemo } from 'react';
import {
  Table,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { MergedSalesRecord } from '../types/retail';
import { exportToCsv } from '../utils/excelParser';

interface Props {
  records: MergedSalesRecord[];
}

export const DataTable: React.FC<Props> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof MergedSalesRecord>('weekStartDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.storeName.toLowerCase().includes(term) ||
        r.storeId.toLowerCase().includes(term) ||
        r.region.toLowerCase().includes(term) ||
        r.city.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term) ||
        r.storeFormat.toLowerCase().includes(term) ||
        r.weekStartDate.includes(term)
    );
  }, [records, searchTerm]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA || '').localeCompare(String(valB || ''))
        : String(valB || '').localeCompare(String(valA || ''));
    });
  }, [filteredRecords, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const paginatedRows = sortedRecords.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  const handleSort = (field: keyof MergedSalesRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatCurr = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      {/* Table Header controls */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-sky-400" />
          <h4 className="text-sm font-semibold text-slate-100">
            Granular Sales & Transaction Records
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            ({sortedRecords.length} records)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search store, category, region..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-48 sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => exportToCsv(sortedRecords, 'retail_filtered_sales.csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors cursor-pointer"
            title="Export currently filtered dataset to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold select-none">
            <tr>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('weekStartDate')}
              >
                <div className="flex items-center gap-1">
                  <span>Week</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('storeName')}
              >
                <div className="flex items-center gap-1">
                  <span>Store</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('region')}
              >
                <div className="flex items-center gap-1">
                  <span>Region</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('grossSales')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Gross ($)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('netSales')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Net Sales ($)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('targetAchievementPct')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Target Achv (%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('returnRatePct')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Return (%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('atv')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>ATV ($)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('stockoutIncidents')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Stockouts</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                  No transaction records match the active criteria.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                    {row.weekStartDate}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                    <div>{row.storeName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {row.storeId} • {row.storeFormat}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">
                    {row.region} ({row.city})
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 truncate max-w-[140px]" title={row.category}>
                    {row.category}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {formatCurr(row.grossSales)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-sky-400">
                    {formatCurr(row.netSales)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`font-semibold ${
                        row.targetAchievementPct >= 100 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {row.targetAchievementPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`${
                        row.returnRatePct > 8 ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {row.returnRatePct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    ${row.atv.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {row.stockoutIncidents > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                        {row.stockoutIncidents}
                      </span>
                    ) : (
                      <span className="text-slate-600">0</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>per page</span>
        </div>

        <div className="flex items-center gap-2">
          <span>
            Page <span className="font-semibold text-slate-200">{pageIndex}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pageIndex <= 1}
              onClick={() => setCurrentPage(pageIndex - 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={pageIndex >= totalPages}
              onClick={() => setCurrentPage(pageIndex + 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
