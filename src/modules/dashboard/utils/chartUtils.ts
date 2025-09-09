import type { ServiceOrder } from '../../serviceOrder/types/serviceOrder';

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  ordersCount: number;
}

export interface StatusCount {
  status: string;
  count: number;
  percentage: number;
}

/**
 * Calcula a receita mensal dos últimos N meses
 */
export function calculateMonthlyRevenue(
  serviceOrders: ServiceOrder[], 
  monthsBack: number = 6
): MonthlyRevenue[] {
  const completedOrders = serviceOrders.filter(
    order => order.status === 'COMPLETED' || order.status === 'DELIVERED'
  );

  const now = new Date();
  const months: MonthlyRevenue[] = [];
  
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    const monthOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.actualCompletion || order.createdAt);
      const orderMonthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      return orderMonthKey === monthKey;
    });

    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalCost, 0);
    
    months.push({
      month: monthLabel,
      revenue: monthRevenue,
      ordersCount: monthOrders.length,
    });
  }

  return months;
}

/**
 * Calcula a distribuição de ordens por status
 */
export function calculateStatusDistribution(serviceOrders: ServiceOrder[]): StatusCount[] {
  const statusCounts = serviceOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = serviceOrders.length;
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

/**
 * Formata valor monetário para Real brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Calcula métricas de resumo da receita
 */
export function calculateRevenueSummary(serviceOrders: ServiceOrder[]) {
  const completedOrders = serviceOrders.filter(
    order => order.status === 'COMPLETED' || order.status === 'DELIVERED'
  );

  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalCost, 0);
  const averageOrderValue = completedOrders.length > 0 
    ? totalRevenue / completedOrders.length 
    : 0;

  // Receita do mês atual
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthRevenue = completedOrders
    .filter(order => {
      const orderDate = new Date(order.actualCompletion || order.createdAt);
      const orderMonthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      return orderMonthKey === currentMonthKey;
    })
    .reduce((sum, order) => sum + order.totalCost, 0);

  // Receita do mês anterior
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  
  const lastMonthRevenue = completedOrders
    .filter(order => {
      const orderDate = new Date(order.actualCompletion || order.createdAt);
      const orderMonthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      return orderMonthKey === lastMonthKey;
    })
    .reduce((sum, order) => sum + order.totalCost, 0);

  const monthlyGrowth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  return {
    totalRevenue,
    averageOrderValue,
    currentMonthRevenue,
    lastMonthRevenue,
    monthlyGrowth,
    completedOrdersCount: completedOrders.length,
  };
}
