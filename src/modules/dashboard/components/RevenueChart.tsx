import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ServiceOrder } from '../../serviceOrder/types/serviceOrder';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueChartProps {
  serviceOrders: ServiceOrder[];
}

export default function RevenueChart({ serviceOrders }: RevenueChartProps) {
  // Filtrar apenas ordens concluídas e entregues para calcular a renda
  const completedOrders = serviceOrders.filter(
    order => order.status === 'COMPLETED' || order.status === 'DELIVERED'
  );

  // Processar dados por mês dos últimos 6 meses
  const now = new Date();
  const months: { label: string; value: number }[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    
    const monthRevenue = completedOrders
      .filter(order => {
        const orderDate = new Date(order.actualCompletion || order.createdAt);
        const orderMonthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        return orderMonthKey === monthKey;
      })
      .reduce((sum, order) => sum + order.totalCost, 0);
    
    months.push({
      label: monthLabel,
      value: monthRevenue,
    });
  }

  const data = {
    labels: months.map(month => month.label),
    datasets: [
      {
        label: 'Receita (R$)',
        data: months.map(month => month.value),
        fill: true,
        backgroundColor: 'rgba(251, 146, 60, 0.1)', // Orange com transparência
        borderColor: 'rgb(251, 146, 60)', // Orange
        borderWidth: 2,
        pointBackgroundColor: 'rgb(251, 146, 60)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3, // Curvatura suave da linha
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Esconder legenda já que só temos uma linha
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            return `Receita: ${value.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="w-full h-full">
      <Line data={data} options={options} />
    </div>
  );
}
