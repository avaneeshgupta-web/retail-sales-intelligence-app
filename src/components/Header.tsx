import React from 'react';
import {
  BarChart3,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MergedSalesRecord, KpiMetrics, ExecutiveInsightsData } from '../types/retail';
import { exportToCsv } from '../utils/excelParser';
import { generateTextReport, downloadExecutiveReport } from '../utils/analytics';

interface Props {
  filteredRecords: MergedSalesRecord[];
  kpis: KpiMetrics;
  insights: ExecutiveInsightsData;
  activeFilterSummary: string;
  onResetFilters: () => void;
  onLoadDemo: () => void;
  activeTab: 'dashboard' | 'table';
  setActiveTab: (tab: 'dashboard' | 'table') => void;
}

export const Header: React.FC<Props> = ({
  filteredRecords,
  kpis,
  insights,
  activeFilterSummary,
  onResetFilters,
  onLoadDemo,
  activeTab,
  setActiveTab,
}) => {
  const handleExportCsv = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    exportToCsv(filteredRecords, `retail_sales_intelligence_${timestamp}.csv`);
  };

  const handleDownloadReport = () => {
    const report = generateTextReport(filteredRecords, kpis, insights, activeFilterSummary);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadExecutiveReport(report, `executive_business_insights_${timestamp}.txt`);
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Title and Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white">
                Retail Sales Intelligence
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-file sales telemetry, KPI tracking & executive diagnostics
            </p>
          </div>
        </div>

        {/* View Switcher and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dashboard / Table view toggle */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Data Explorer ({filteredRecords.length})
            </button>
          </div>

          {/* Quick CSV Export */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>

          {/* Download Text Report */}
          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm cursor-pointer"
            title="Download executive insights summary report"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Insights Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
