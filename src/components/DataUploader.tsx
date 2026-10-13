import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Database,
  Download,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  parseStoreMasterExcel,
  parseWeeklySalesExcel,
  mergeSalesWithStores,
  downloadSampleExcel,
} from '../utils/excelParser';
import {
  StoreMasterRecord,
  WeeklySalesRecord,
  MergedSalesRecord,
} from '../types/retail';
import { DEMO_STORES, generateDemoSalesData } from '../data/demoData';

interface Props {
  onDataLoaded: (
    merged: MergedSalesRecord[],
    stores: StoreMasterRecord[],
    sales: WeeklySalesRecord[],
    datasetSource: string
  ) => void;
  currentStoreCount: number;
  currentSalesCount: number;
  datasetSource: string;
}

export const DataUploader: React.FC<Props> = ({
  onDataLoaded,
  currentStoreCount,
  currentSalesCount,
  datasetSource,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [salesFileStatus, setSalesFileStatus] = useState<{
    name: string | null;
    loading: boolean;
    error: string | null;
    count: number;
  }>({ name: null, loading: false, error: null, count: currentSalesCount });

  const [storesFileStatus, setStoresFileStatus] = useState<{
    name: string | null;
    loading: boolean;
    error: string | null;
    count: number;
  }>({ name: null, loading: false, error: null, count: currentStoreCount });

  // Store in-memory staged files until both or either is present
  const stagedStoresRef = useRef<StoreMasterRecord[] | null>(null);
  const stagedSalesRef = useRef<WeeklySalesRecord[] | null>(null);

  const handleSalesUpload = async (file: File) => {
    setSalesFileStatus({ name: file.name, loading: true, error: null, count: 0 });
    try {
      const parsedSales = await parseWeeklySalesExcel(file);
      stagedSalesRef.current = parsedSales;
      setSalesFileStatus({
        name: file.name,
        loading: false,
        error: null,
        count: parsedSales.length,
      });

      // Use staged stores or fall back to demo stores if user uploaded sales first
      const storesToUse = stagedStoresRef.current || DEMO_STORES;
      const merged = mergeSalesWithStores(parsedSales, storesToUse);
      onDataLoaded(merged, storesToUse, parsedSales, `Custom (${file.name})`);
    } catch (err: any) {
      setSalesFileStatus({
        name: file.name,
        loading: false,
        error: err.message || 'Failed to parse sales file',
        count: 0,
      });
    }
  };

  const handleStoresUpload = async (file: File) => {
    setStoresFileStatus({ name: file.name, loading: true, error: null, count: 0 });
    try {
      const parsedStores = await parseStoreMasterExcel(file);
      stagedStoresRef.current = parsedStores;
      setStoresFileStatus({
        name: file.name,
        loading: false,
        error: null,
        count: parsedStores.length,
      });

      // Use staged sales or fall back to demo sales if user uploaded store master first
      const salesToUse = stagedSalesRef.current || generateDemoSalesData();
      const merged = mergeSalesWithStores(salesToUse, parsedStores);
      onDataLoaded(merged, parsedStores, salesToUse, `Custom (${file.name})`);
    } catch (err: any) {
      setStoresFileStatus({
        name: file.name,
        loading: false,
        error: err.message || 'Failed to parse store master file',
        count: 0,
      });
    }
  };

  const handleLoadDemo = () => {
    const demoSales = generateDemoSalesData();
    stagedStoresRef.current = DEMO_STORES;
    stagedSalesRef.current = demoSales;
    const merged = mergeSalesWithStores(demoSales, DEMO_STORES);
    setSalesFileStatus({ name: 'retail_weekly_sales.xlsx (Demo)', loading: false, error: null, count: demoSales.length });
    setStoresFileStatus({ name: 'store_master.xlsx (Demo)', loading: false, error: null, count: DEMO_STORES.length });
    onDataLoaded(merged, DEMO_STORES, demoSales, 'Pre-loaded Enterprise Retail Demo');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-md overflow-hidden">
      {/* Top Banner Bar */}
      <div className="px-4 py-3 bg-slate-900 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">
                Data Ingestion Engine
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Active: {datasetSource}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Joined {currentSalesCount.toLocaleString()} transactions across {currentStoreCount} stores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Dataset</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>{isExpanded ? 'Hide Upload Panel' : 'Upload Excel Files'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Upload Area */}
      {isExpanded && (
        <div className="p-4 bg-slate-950/40 border-t border-slate-800/40 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uploader 1: retail_weekly_sales.xlsx */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      retail_weekly_sales.xlsx
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadSampleExcel('sales')}
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                    title="Download template file to inspect format"
                  >
                    <Download className="w-3 h-3" />
                    <span>Template</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Upload weekly transaction records (Week_Start_Date, Store_ID, Category, Gross_Sales, Discount_Amount, Return_Amount, Transactions, Sales_Target, Stockout_Incidents).
                </p>

                <label className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950/30 hover:bg-slate-900/40 transition-all text-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                  <span className="text-xs font-medium text-slate-300">
                    Click to browse or drop file here
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Supports .xlsx, .xls, .csv
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleSalesUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {salesFileStatus.loading && (
                <div className="mt-3 flex items-center gap-2 text-xs text-sky-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing sales data with SheetJS...</span>
                </div>
              )}

              {salesFileStatus.error && (
                <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{salesFileStatus.error}</span>
                </div>
              )}

              {salesFileStatus.name && !salesFileStatus.error && !salesFileStatus.loading && (
                <div className="mt-3 flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{salesFileStatus.name}</span>
                  </div>
                  <span className="font-mono shrink-0 ml-2 font-semibold">
                    {salesFileStatus.count} rows
                  </span>
                </div>
              )}
            </div>

            {/* Uploader 2: store_master.xlsx */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      store_master.xlsx
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadSampleExcel('stores')}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                    title="Download template file to inspect format"
                  >
                    <Download className="w-3 h-3" />
                    <span>Template</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Upload store metadata hierarchy (Store_ID, Store_Name, Region, City, Store_Format, Store_Manager, Sales_Target).
                </p>

                <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950/30 hover:bg-slate-900/40 transition-all text-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                  <span className="text-xs font-medium text-slate-300">
                    Click to browse or drop file here
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Supports .xlsx, .xls, .csv
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleStoresUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {storesFileStatus.loading && (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing store master with SheetJS...</span>
                </div>
              )}

              {storesFileStatus.error && (
                <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{storesFileStatus.error}</span>
                </div>
              )}

              {storesFileStatus.name && !storesFileStatus.error && !storesFileStatus.loading && (
                <div className="mt-3 flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{storesFileStatus.name}</span>
                  </div>
                  <span className="font-mono shrink-0 ml-2 font-semibold">
                    {storesFileStatus.count} stores
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
