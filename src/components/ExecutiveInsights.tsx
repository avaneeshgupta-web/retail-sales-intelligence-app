import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  AlertOctagon,
  RotateCcw,
  PackageX,
  CheckCircle,
  Copy,
  Download,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import {
  ExecutiveInsightsData,
  MergedSalesRecord,
  KpiMetrics,
} from '../types/retail';
import {
  generateTextReport,
  downloadExecutiveReport,
} from '../utils/analytics';

interface Props {
  insights: ExecutiveInsightsData;
  records: MergedSalesRecord[];
  kpis: KpiMetrics;
  activeFilterSummary: string;
}

export const ExecutiveInsights: React.FC<Props> = ({
  insights,
  records,
  kpis,
  activeFilterSummary,
}) => {
  const [copied, setCopied] = useState(false);

  const formatCurr = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);

  const handleCopyReport = () => {
    const report = generateTextReport(records, kpis, insights, activeFilterSummary);
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadReport = () => {
    const report = generateTextReport(records, kpis, insights, activeFilterSummary);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadExecutiveReport(report, `executive_business_insights_${timestamp}.txt`);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Executive Business Insights & Synthesis
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${insights.overallVerdict.badgeColor}`}>
                {insights.overallVerdict.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automated intelligence briefing generated from active filtered transaction telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Copy plain-text briefing to clipboard"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied Briefing!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-sm cursor-pointer"
            title="Download full executive report as TXT"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (.txt)</span>
          </button>
        </div>
      </div>

      {/* Narrative Synthesis */}
      <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs leading-relaxed text-slate-300">
        <p>{insights.overallVerdict.summaryParagraph}</p>
      </div>

      {/* 4 Focused Business Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Pillar 1: Best & Worst Performing Regions */}
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Regional Polarization</span>
            </div>
            <div className="space-y-2 mt-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-300">★ Best: {insights.bestRegion.name}</span>
                  <span className="font-bold text-emerald-400">{insights.bestRegion.achievementPct.toFixed(1)}%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Net Revenue: {formatCurr(insights.bestRegion.netSales)}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-300">▼ Lagging: {insights.worstRegion.name}</span>
                  <span className="font-bold text-rose-400">{insights.worstRegion.achievementPct.toFixed(1)}%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Net Revenue: {formatCurr(insights.worstRegion.netSales)}
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
            Regional spread: {(insights.bestRegion.achievementPct - insights.worstRegion.achievementPct).toFixed(1)}% attainment delta
          </p>
        </div>

        {/* Pillar 2: Stores Failing Target Achievement (< 100%) */}
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                <span>Target Deficits (&lt;100%)</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {insights.failingStores.length} of {insights.totalStoresCount} Stores
              </span>
            </div>

            {insights.failingStores.length === 0 ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>All active stores achieving &gt;100% quota!</span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {insights.failingStores.slice(0, 4).map((s) => (
                  <div
                    key={s.storeId}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                  >
                    <div className="truncate pr-1">
                      <div className="font-medium text-slate-200 truncate">{s.storeName}</div>
                      <div className="text-[10px] text-slate-400">{s.region} • {s.storeFormat}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-rose-400">{s.achievementPct}%</span>
                      <div className="text-[10px] text-slate-400">-{formatCurr(Math.abs(s.variance))}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            {insights.failingStores.length > 4 ? `+ ${insights.failingStores.length - 4} additional stores below quota` : 'Monitored across retail footprint'}
          </p>
        </div>

        {/* Pillar 3: Categories with High Return Rates (> 8%) */}
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>High Returns (&gt;8%)</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {insights.highReturnCategories.length} Categories
              </span>
            </div>

            {insights.highReturnCategories.length === 0 ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>All product lines maintain returns &le;8%</span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {insights.highReturnCategories.map((c) => (
                  <div
                    key={c.category}
                    className="p-1.5 rounded-lg bg-rose-500/5 border border-rose-500/20 flex items-center justify-between text-[11px]"
                  >
                    <div className="truncate pr-1">
                      <div className="font-medium text-slate-200 truncate">{c.category}</div>
                      <div className="text-[10px] text-slate-400">Total Refund: {formatCurr(c.returnAmount)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-rose-400">{c.returnRatePct}%</span>
                      <div className="text-[10px] text-rose-300/80">Threshold Exceeded</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            Total refund drag: {formatCurr(insights.highReturnCategories.reduce((acc, c) => acc + c.returnAmount, 0))}
          </p>
        </div>

        {/* Pillar 4: Critical Stockout Alerts */}
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
              <div className="flex items-center gap-2">
                <PackageX className="w-3.5 h-3.5 text-amber-400" />
                <span>Critical Stockout Risk</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {insights.criticalStockouts.totalIncidents} Total OOS
              </span>
            </div>

            <div className="space-y-2 mt-1">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <div className="text-[11px] text-slate-400">Primary Stockout Driver:</div>
                <div className="font-semibold text-slate-100 mt-0.5 flex items-center justify-between">
                  <span>{insights.criticalStockouts.topCategory}</span>
                  <span className="text-amber-400 font-bold">{insights.criticalStockouts.topCategoryIncidents} events</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="text-[11px] text-amber-300/90 font-medium">Est. Revenue Impact:</div>
                <div className="font-bold text-amber-400 text-sm mt-0.5">
                  ~{formatCurr(insights.criticalStockouts.estimatedLostSales)}
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
            Supply chain replenishment recommendation active
          </p>
        </div>
      </div>

      {/* Strategic Prescriptions & Action Items */}
      <div className="pt-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Strategic Recommendations & Action Items</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {insights.overallVerdict.keyRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
            >
              <div className="w-5 h-5 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="leading-snug">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
