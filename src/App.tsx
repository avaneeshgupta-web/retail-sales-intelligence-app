import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { DataUploader } from './components/DataUploader';
import { KpiCards } from './components/KpiCards';
import { MultiFilterBar } from './components/MultiFilterBar';
import { ChartsSection } from './components/ChartsSection';
import { ExecutiveInsights } from './components/ExecutiveInsights';
import { DataTable } from './components/DataTable';
import {
  StoreMasterRecord,
  WeeklySalesRecord,
  MergedSalesRecord,
  FilterState,
} from './types/retail';
import { DEMO_STORES, generateDemoSalesData } from './data/demoData';
import { mergeSalesWithStores } from './utils/excelParser';
import {
  calculateKpis,
  computeWeeklyTrend,
  computeRegionalSplits,
  computeCategoryPerformance,
  computeStoreLeaderboard,
  computeStockoutRisk,
  generateExecutiveInsights,
} from './utils/analytics';

export default function App() {
  // Master Raw Data State (initialized with demo dataset)
  const [stores, setStores] = useState<StoreMasterRecord[]>(DEMO_STORES);
  const [sales, setSales] = useState<WeeklySalesRecord[]>(() => generateDemoSalesData());
  const [datasetSource, setDatasetSource] = useState<string>('Pre-loaded Retail Demo Dataset');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table'>('dashboard');

  // Merged Records
  const [mergedRecords, setMergedRecords] = useState<MergedSalesRecord[]>(() => {
    const demoSales = generateDemoSalesData();
    return mergeSalesWithStores(demoSales, DEMO_STORES);
  });

  // Multi-Filter State
  const [filters, setFilters] = useState<FilterState>({
    weekStartDates: [],
    regions: [],
    storeNames: [],
    cities: [],
    storeFormats: [],
    categories: [],
  });

  // Handler for file ingestion
  const handleDataLoaded = (
    newMerged: MergedSalesRecord[],
    newStores: StoreMasterRecord[],
    newSales: WeeklySalesRecord[],
    sourceName: string
  ) => {
    setStores(newStores);
    setSales(newSales);
    setMergedRecords(newMerged);
    setDatasetSource(sourceName);
    // Reset filters when a brand new dataset is loaded to avoid stale filter locks
    setFilters({
      weekStartDates: [],
      regions: [],
      storeNames: [],
      cities: [],
      storeFormats: [],
      categories: [],
    });
  };

  const handleResetFilters = () => {
    setFilters({
      weekStartDates: [],
      regions: [],
      storeNames: [],
      cities: [],
      storeFormats: [],
      categories: [],
    });
  };

  const handleReloadDemo = () => {
    const demoSales = generateDemoSalesData();
    const demoMerged = mergeSalesWithStores(demoSales, DEMO_STORES);
    setStores(DEMO_STORES);
    setSales(demoSales);
    setMergedRecords(demoMerged);
    setDatasetSource('Pre-loaded Retail Demo Dataset');
    handleResetFilters();
  };

  // Instant Filter Application
  const filteredRecords = useMemo(() => {
    return mergedRecords.filter((record) => {
      if (
        filters.weekStartDates.length > 0 &&
        !filters.weekStartDates.includes(record.weekStartDate)
      ) {
        return false;
      }
      if (
        filters.regions.length > 0 &&
        !filters.regions.includes(record.region)
      ) {
        return false;
      }
      if (
        filters.storeNames.length > 0 &&
        !filters.storeNames.includes(record.storeName)
      ) {
        return false;
      }
      if (
        filters.cities.length > 0 &&
        !filters.cities.includes(record.city)
      ) {
        return false;
      }
      if (
        filters.storeFormats.length > 0 &&
        !filters.storeFormats.includes(record.storeFormat)
      ) {
        return false;
      }
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(record.category)
      ) {
        return false;
      }
      return true;
    });
  }, [mergedRecords, filters]);

  // Derived Reactive Calculations
  const kpis = useMemo(() => calculateKpis(filteredRecords), [filteredRecords]);
  const weeklyTrend = useMemo(() => computeWeeklyTrend(filteredRecords), [filteredRecords]);
  const regionalSplits = useMemo(() => computeRegionalSplits(filteredRecords), [filteredRecords]);
  const categoryPerformance = useMemo(
    () => computeCategoryPerformance(filteredRecords),
    [filteredRecords]
  );
  const storeLeaderboard = useMemo(
    () => computeStoreLeaderboard(filteredRecords),
    [filteredRecords]
  );
  const stockoutRisk = useMemo(() => computeStockoutRisk(filteredRecords), [filteredRecords]);
  const executiveInsights = useMemo(
    () => generateExecutiveInsights(filteredRecords, kpis),
    [filteredRecords, kpis]
  );

  // Active filter text summary for reports
  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.weekStartDates.length > 0) parts.push(`Weeks: ${filters.weekStartDates.join(', ')}`);
    if (filters.regions.length > 0) parts.push(`Regions: ${filters.regions.join(', ')}`);
    if (filters.storeNames.length > 0) parts.push(`Stores: ${filters.storeNames.join(', ')}`);
    if (filters.cities.length > 0) parts.push(`Cities: ${filters.cities.join(', ')}`);
    if (filters.storeFormats.length > 0) parts.push(`Formats: ${filters.storeFormats.join(', ')}`);
    if (filters.categories.length > 0) parts.push(`Categories: ${filters.categories.join(', ')}`);
    return parts.length > 0 ? parts.join(' | ') : 'All data (No filters active)';
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Top Navigation & App Header */}
      <Header
        filteredRecords={filteredRecords}
        kpis={kpis}
        insights={executiveInsights}
        activeFilterSummary={activeFilterSummary}
        onResetFilters={handleResetFilters}
        onLoadDemo={handleReloadDemo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Section 1: Data Ingestion & Demo Loader */}
        <DataUploader
          onDataLoaded={handleDataLoaded}
          currentStoreCount={stores.length}
          currentSalesCount={sales.length}
          datasetSource={datasetSource}
        />

        {/* Section 2: Dynamic Multi-Filter Bar */}
        <MultiFilterBar
          allRecords={mergedRecords}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          filteredCount={filteredRecords.length}
          totalCount={mergedRecords.length}
        />

        {/* Section 3: Top KPI Scorecards */}
        <KpiCards kpis={kpis} />

        {/* Section 4 & 5: Tab Switcher (Dashboard vs Raw Records Explorer) */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-4">
            {/* Section 4: 5 Interactive Chart.js Visualizations */}
            <ChartsSection
              weeklyTrend={weeklyTrend}
              regionalSplits={regionalSplits}
              categoryPerformance={categoryPerformance}
              storeLeaderboard={storeLeaderboard}
              stockoutRisk={stockoutRisk}
            />

            {/* Section 5: Automated Executive Business Insights Summary */}
            <ExecutiveInsights
              insights={executiveInsights}
              records={filteredRecords}
              kpis={kpis}
              activeFilterSummary={activeFilterSummary}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable records={filteredRecords} />
          </div>
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Retail Sales Intelligence Engine • Multi-source Excel & SheetJS Analytics</span>
          <span className="font-mono text-[11px] text-slate-400">
            Formulas: Net = Gross - Disc - Returns | Achv% = Net/Target | ATV = Net/Txns | Return% = Returns/Net
          </span>
        </div>
      </footer>
    </div>
  );
}
