import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { StoreLeaderboardData } from '../../utils/analytics';

interface Props {
  data: StoreLeaderboardData;
}

export const StoreLeaderboardChart: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [viewMode, setViewMode] = useState<'both' | 'top5' | 'bottom5'>('both');

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let displayStores = [...data.top5, ...data.bottom5];
    if (viewMode === 'top5') displayStores = data.top5;
    if (viewMode === 'bottom5') displayStores = data.bottom5;

    // Remove duplicates if any (e.g. if fewer than 10 total stores exist)
    const uniqueMap = new Map();
    displayStores.forEach((s) => uniqueMap.set(s.storeId, s));
    const stores = Array.from(uniqueMap.values());

    const labels = stores.map(
      (s) => `${s.storeName} (${s.achievementPct}%)`
    );
    const netSales = stores.map((s) => s.netSales);
    const targets = stores.map((s) => s.salesTarget);

    const barColors = stores.map((s) =>
      s.achievementPct >= 100
        ? 'rgba(16, 185, 129, 0.85)' // Emerald for >=100%
        : 'rgba(244, 63, 94, 0.85)' // Rose for <100%
    );

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Net Sales ($)',
            data: netSales,
            backgroundColor: barColors,
            borderRadius: 4,
            barThickness: 14,
          },
          {
            label: 'Sales Target ($)',
            data: targets,
            backgroundColor: 'rgba(148, 163, 184, 0.3)',
            borderColor: 'rgba(148, 163, 184, 0.7)',
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 14,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              usePointStyle: true,
              color: '#94a3b8',
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11,
              },
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            padding: 12,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.x ?? 0;
                return ` ${label}: $${val.toLocaleString()}`;
              },
              afterBody: (items) => {
                const idx = items[0].dataIndex;
                const store = stores[idx];
                const variance = store.netSales - store.salesTarget;
                const sign = variance >= 0 ? '+' : '';
                return [
                  ` Format: ${store.storeFormat} | Region: ${store.region}`,
                  ` Achievement: ${store.achievementPct}% (${sign}$${variance.toLocaleString()})`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(51, 65, 85, 0.3)',
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 11,
              },
              callback: (value) => `$${(Number(value) / 1000).toFixed(0)}k`,
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#cbd5e1',
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, viewMode]);

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
          <span>≥100% Target Met</span>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500 ml-2"></span>
          <span>&lt;100% Below Target</span>
        </div>
        <div className="inline-flex rounded-lg bg-slate-900/80 p-0.5 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'both' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 10
          </button>
          <button
            type="button"
            onClick={() => setViewMode('top5')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'top5' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top 5
          </button>
          <button
            type="button"
            onClick={() => setViewMode('bottom5')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'bottom5' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bottom 5
          </button>
        </div>
      </div>
      <div className="w-full flex-1 min-h-[300px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
