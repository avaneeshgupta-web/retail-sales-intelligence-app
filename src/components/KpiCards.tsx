import React from 'react';
import {
  DollarSign,
  Target,
  ShoppingCart,
  RotateCcw,
  Percent,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { KpiMetrics } from '../types/retail';

interface Props {
  kpis: KpiMetrics;
}

export const KpiCards: React.FC<Props> = ({ kpis }) => {
  const formatCurr = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);

  const formatShortCurr = (n: number) => {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
    return `$${Math.round(n)}`;
  };

  const isTargetAchieved = kpis.targetAchievementPct >= 100;
  const isReturnHigh = kpis.returnRatePct > 8.0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {/* 1. NET SALES */}
      <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Net Sales
          </span>
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold tracking-tight text-white">
            {formatShortCurr(kpis.totalNetSales)}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 truncate" title={`Gross: ${formatCurr(kpis.totalGrossSales)}`}>
          Gross: <span className="text-slate-300 font-medium">{formatShortCurr(kpis.totalGrossSales)}</span>
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Returns & Disc.</span>
          <span className="text-slate-300 font-medium">
            -{formatShortCurr(kpis.totalDiscountAmount + kpis.totalReturnAmount)}
          </span>
        </div>
      </div>

      {/* 2. TARGET ACHIEVEMENT % */}
      <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Target Achieved
          </span>
          <div className={`p-1.5 rounded-lg ${isTargetAchieved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold tracking-tight text-white">
            {kpis.targetAchievementPct.toFixed(1)}%
          </div>
          <span className={`text-[11px] font-semibold flex items-center ${isTargetAchieved ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isTargetAchieved ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
            {isTargetAchieved ? 'Met' : 'Short'}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5 mt-2">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${isTargetAchieved ? 'bg-emerald-400' : 'bg-amber-400'}`}
            style={{ width: `${Math.min(100, kpis.targetAchievementPct)}%` }}
          />
        </div>
        <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Quota</span>
          <span className="text-slate-300 font-medium">{formatShortCurr(kpis.totalSalesTarget)}</span>
        </div>
      </div>

      {/* 3. AVERAGE TRANSACTION VALUE (ATV) */}
      <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Avg Ticket (ATV)
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <ShoppingCart className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold tracking-tight text-white">
            ${kpis.atv.toFixed(2)}
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          Total Transactions
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tickets count</span>
          <span className="text-slate-300 font-medium">{kpis.totalTransactions.toLocaleString()}</span>
        </div>
      </div>

      {/* 4. RETURN RATE % */}
      <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Return Rate %
          </span>
          <div className={`p-1.5 rounded-lg ${isReturnHigh ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className={`text-2xl font-bold tracking-tight ${isReturnHigh ? 'text-rose-400' : 'text-white'}`}>
            {kpis.returnRatePct.toFixed(1)}%
          </div>
          {isReturnHigh && (
            <span className="text-[10px] uppercase font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
              &gt;8% Alert
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400">
          Returns Value: <span className="text-slate-300 font-medium">{formatShortCurr(kpis.totalReturnAmount)}</span>
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Threshold</span>
          <span className="text-slate-300 font-medium">Max 8.0%</span>
        </div>
      </div>

      {/* 5. DISCOUNT RATE % */}
      <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Discount Rate %
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold tracking-tight text-white">
            {kpis.discountRatePct.toFixed(1)}%
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          Discount Amount: <span className="text-slate-300 font-medium">{formatShortCurr(kpis.totalDiscountAmount)}</span>
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>% of Gross</span>
          <span className="text-slate-300 font-medium">{kpis.discountRatePct.toFixed(1)}%</span>
        </div>
      </div>

      {/* 6. TOTAL STOCKOUT INCIDENTS */}
      <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Stockout Incidents
          </span>
          <div className={`p-1.5 rounded-lg ${kpis.totalStockoutIncidents > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-2xl font-bold tracking-tight text-white">
            {kpis.totalStockoutIncidents}
          </div>
          <span className="text-xs text-slate-400 font-medium">events</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Active Store Outages
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Active Stores</span>
          <span className="text-slate-300 font-medium">{kpis.storeCount} stores</span>
        </div>
      </div>
    </div>
  );
};
