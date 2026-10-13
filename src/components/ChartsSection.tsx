import React from 'react';
import {
  TrendingUp,
  MapPin,
  Tag,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import {
  WeeklyTrendData,
  StoreLeaderboardData,
  StockoutRiskData,
} from '../utils/analytics';
import {
  RegionalPerformance,
  CategoryPerformance,
} from '../types/retail';
import { WeeklySalesTrendChart } from './charts/WeeklySalesTrendChart';
import { RegionalRevenueChart } from './charts/RegionalRevenueChart';
import { CategoryPerformanceChart } from './charts/CategoryPerformanceChart';
import { StoreLeaderboardChart } from './charts/StoreLeaderboardChart';
import { StockoutRiskChart } from './charts/StockoutRiskChart';

interface Props {
  weeklyTrend: WeeklyTrendData;
  regionalSplits: RegionalPerformance[];
  categoryPerformance: CategoryPerformance[];
  storeLeaderboard: StoreLeaderboardData;
  stockoutRisk: StockoutRiskData;
}

export const ChartsSection: React.FC<Props> = ({
  weeklyTrend,
  regionalSplits,
  categoryPerformance,
  storeLeaderboard,
  stockoutRisk,
}) => {
  return (
    <div className="space-y-4">
      {/* ROW 1: Weekly Sales Trend + Stockout Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Weekly Sales Trend */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Weekly Sales Trend & Target Variance
                </h3>
                <p className="text-[11px] text-slate-400">
                  Continuous Net Sales trajectory vs Sales Target over time
                </p>
              </div>
            </div>
          </div>
          <WeeklySalesTrendChart data={weeklyTrend} />
        </div>

        {/* Chart 5: Stockout Risk Doughnut */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Stockout Risk by Category
                </h3>
                <p className="text-[11px] text-slate-400">
                  Incident share across merchandise groups
                </p>
              </div>
            </div>
          </div>
          <StockoutRiskChart data={stockoutRisk} />
        </div>
      </div>

      {/* ROW 2: Regional Revenue Splitting + Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 2: Regional Revenue Splitting */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Regional Revenue Splitting & Quota Achievement
                </h3>
                <p className="text-[11px] text-slate-400">
                  Net Sales and Target Achievement % across operating territories
                </p>
              </div>
            </div>
          </div>
          <RegionalRevenueChart data={regionalSplits} />
        </div>

        {/* Chart 3: Category Performance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Category Performance & Return Rate %
                </h3>
                <p className="text-[11px] text-slate-400">
                  Gross Sales vs Net Sales and category return percentage (&gt;8% threshold)
                </p>
              </div>
            </div>
          </div>
          <CategoryPerformanceChart data={categoryPerformance} />
        </div>
      </div>

      {/* ROW 3: Store Leaderboard (Top 5 vs Bottom 5) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Store Leaderboard: Top 5 Overachievers vs Bottom 5 Stores
              </h3>
              <p className="text-[11px] text-slate-400">
                Horizontal performance comparison against store sales quotas
              </p>
            </div>
          </div>
        </div>
        <StoreLeaderboardChart data={storeLeaderboard} />
      </div>
    </div>
  );
};
