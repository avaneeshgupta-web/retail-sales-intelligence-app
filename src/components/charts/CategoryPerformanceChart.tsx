import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { CategoryPerformance } from '../../types/retail';

interface Props {
  data: CategoryPerformance[];
}

export const CategoryPerformanceChart: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map((d) => d.category);
    const grossSales = data.map((d) => d.grossSales);
    const netSales = data.map((d) => d.netSales);
    const returnRates = data.map((d) => d.returnRatePct);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Gross Sales ($)',
            data: grossSales,
            backgroundColor: 'rgba(168, 85, 247, 0.75)',
            hoverBackgroundColor: 'rgba(168, 85, 247, 1)',
            borderRadius: 6,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'bar',
            label: 'Net Sales ($)',
            data: netSales,
            backgroundColor: 'rgba(14, 165, 233, 0.85)',
            hoverBackgroundColor: 'rgba(14, 165, 233, 1)',
            borderRadius: 6,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'Return Rate (%)',
            data: returnRates,
            borderColor: '#f43f5e',
            backgroundColor: '#f43f5e',
            borderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: (ctx) => {
              const val = returnRates[ctx.dataIndex];
              return val > 8.0 ? '#f43f5e' : '#fb7185';
            },
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
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
                  const alertFlag = val > 8.0 ? ' ⚠️ [High Return >8%]' : '';
                  return ` ${label}: ${val.toFixed(1)}%${alertFlag}`;
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
              maxRotation: 25,
              minRotation: 0,
            },
          },
          y: {
            type: 'linear',
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
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: '#f43f5e',
              font: {
                size: 11,
              },
              callback: (value) => `${value}%`,
            },
            suggestedMin: 0,
            suggestedMax: 18,
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
