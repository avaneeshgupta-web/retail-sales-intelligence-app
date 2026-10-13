import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { StockoutRiskData } from '../../utils/analytics';

interface Props {
  data: StockoutRiskData;
}

export const StockoutRiskChart: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const colors = [
    '#f43f5e', // rose/red
    '#f59e0b', // amber
    '#38bdf8', // sky
    '#a855f7', // purple
    '#10b981', // emerald
    '#6366f1', // indigo
    '#ec4899', // pink
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.categories,
        datasets: [
          {
            data: data.counts,
            backgroundColor: colors.slice(0, data.categories.length),
            borderColor: '#0f172a',
            borderWidth: 2.5,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            display: false, // We render a custom structured legend below for cleaner readability
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
                const label = context.label || '';
                const val = context.parsed;
                const idx = context.dataIndex;
                const pct = data.percentages[idx] || 0;
                return ` ${label}: ${val} incidents (${pct}%)`;
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
  }, [data]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-48 h-48 my-1 flex items-center justify-center">
        <canvas ref={canvasRef} />
        {/* Center Total Count Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-white tracking-tight">
            {data.totalIncidents}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Total OOS
          </span>
        </div>
      </div>

      {/* Category breakdown rows */}
      <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
        {data.categories.map((cat, idx) => (
          <div key={cat} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 truncate pr-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="text-slate-300 truncate font-medium text-[11px]" title={cat}>
                {cat}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-semibold text-slate-100">{data.counts[idx]}</span>
              <span className="text-[10px] text-slate-400 ml-1">({data.percentages[idx]}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
