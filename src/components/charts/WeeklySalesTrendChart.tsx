import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { WeeklyTrendData } from '../../utils/analytics';

interface Props {
  data: WeeklyTrendData;
}

export const WeeklySalesTrendChart: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Gradient fill for net sales
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Net Sales ($)',
            data: data.netSales,
            borderColor: '#38bdf8',
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#0284c7',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            yAxisID: 'y',
          },
          {
            label: 'Sales Target ($)',
            data: data.targets,
            borderColor: '#f59e0b',
            borderDash: [6, 4],
            backgroundColor: 'transparent',
            borderWidth: 2.2,
            pointRadius: 3,
            pointBackgroundColor: '#f59e0b',
            tension: 0.2,
            yAxisID: 'y',
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
            boxPadding: 6,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y ?? 0;
                return ` ${label}: $${val.toLocaleString()}`;
              },
              afterBody: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                const achievement = data.achievementPct[index];
                return [` Achievement Rate: ${achievement}%`];
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
            },
          },
          y: {
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
