import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

import { useMediaQuery } from '../../../shared/hooks/useMediaQuery'
import type { ServiceOrder } from '../../serviceOrder/types/serviceOrder'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ServiceOrderChartProps {
  serviceOrders: ServiceOrder[];
}

export default function ServiceOrderChart({ serviceOrders }: ServiceOrderChartProps) {
  const isSmallScreen = useMediaQuery('(max-width: 639px)')

  // Processar dados para o gráfico
  const statusCounts = serviceOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Configuração das cores para cada status usando o design system
  const statusColors: Record<string, string> = {
    PENDING: '#FCD34D',
    IN_PROGRESS: '#60A5FA',
    WAITING_PARTS: '#F87171',
    WAITING_APPROVAL: '#f57c00',
    COMPLETED: '#34D399',
    CANCELLED: '#6B7280',
    DELIVERED: '#10B981',
  }

  // Labels em português
  const statusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    IN_PROGRESS: 'Em Andamento',
    WAITING_PARTS: 'Aguardando Peças',
    WAITING_APPROVAL: 'Aguardando Aprovação',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
    DELIVERED: 'Entregue',
  }

  const data = {
    labels: Object.keys(statusCounts).map(status => statusLabels[status] || status),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map(status => statusColors[status] || '#6B7280'),
        borderColor: Object.keys(statusCounts).map(status => statusColors[status] || '#6B7280'),
        borderWidth: 1,
        hoverBackgroundColor: Object.keys(statusCounts).map(status => statusColors[status] || '#6B7280'),
        hoverBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: isSmallScreen ? 15 : 20,
          usePointStyle: true,
          font: {
            size: isSmallScreen ? 10 : 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div className="w-full h-full">
      <Doughnut data={data} options={options} />
    </div>
  )
}
