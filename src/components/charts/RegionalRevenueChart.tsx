import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { RegionalPerformance } from '../../types/retail';

interface Props {
  data: RegionalPerformance[];
}

export const RegionalRevenueChart: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map((d) => d.region);
    const netSales = data.map((d) => d.netSales);
    const targets = data.map((d) => d.salesTarget);
    const achievements = data.map((d) => d.achievementPct);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Net Sales ($)',
            data: netSales,
            backgroundColor: 'rgba(99, 102, 241, 0.85)',
            hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
            borderRadius: 6,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'bar',
            label: 'Sales Target ($)',
            data: targets,
            backgroundColor: 'rgba(148, 163, 184, 0.25)',
            hoverBackgroundColor: 'rgba(148, 163, 184, 0.4)',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: 'rgba(148, 163, 184, 0.6)',
            yAxisID: 'y',
            order: 3,
          },
          {
            type: 'line',
            label: 'Target Achievement (%)',
            data: achievements,
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            yAxisID: 'y1',
            order: 1,
          },
        ],
      },
      options: {
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
                weight: 500,
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
                const val = context.parsed.y ?? 0;
                if (label.includes('%')) {
                  return ` ${label}: ${val.toFixed(1)}%`;
                }
                return ` ${label}: $${val.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 11,
              },
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
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
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: '#10b981',
              font: {
                size: 11,
              },
              callback: (value) => `${value}%`,
            },
            suggestedMin: 70,
            suggestedMax: 130,
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
    <div className="w-full h-72">
      <canvas ref={canvasRef} />
    </div>
  );
};
