import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../../client/services/api'
import { vehiclesApi } from '../../vehicle/services/api'
import { serviceOrdersApi } from '../../serviceOrder/services/api'
import ProtectedRoute from '../../auth/components/ProtectedRoute'
import { useAuth } from '../../auth/hooks/useAuth'
import ChartCard from './ChartCard'
import ServiceOrderChart from './ServiceOrderChart'
import RevenueChart from './RevenueChart'
import { calculateRevenueSummary, formatCurrency } from '../utils/chartUtils'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { data } = useAuth()
  const isAuthenticated = Boolean(data?.accessToken)

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll().then((res) => res.data),
    enabled: isAuthenticated,
  })

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll().then((res) => res.data),
    enabled: isAuthenticated,
  })

  const { data: serviceOrders = [], isLoading: serviceOrdersLoading } =
    useQuery({
      queryKey: ['serviceOrders'],
      queryFn: () => serviceOrdersApi.getAll().then((res) => res.data),
      enabled: isAuthenticated,
    })

  const totalClients = clients.length
  const totalVehicles = vehicles.length
  const totalServiceOrders = serviceOrders.length
  const completedServiceOrders = serviceOrders.filter(
    (order) => order.status === 'COMPLETED',
  ).length
  const pendingServiceOrders = serviceOrders.filter(
    (order) => order.status === 'PENDING',
  ).length
  const inProgressServiceOrders = serviceOrders.filter(
    (order) => order.status === 'IN_PROGRESS',
  ).length

  const revenueSummary = calculateRevenueSummary(serviceOrders)

  const isLoading = clientsLoading || vehiclesLoading || serviceOrdersLoading

  const { name, role } = data?.user || {}

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen rounded-lg">
      {/* Welcome Message */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-orangeWheel-500 text-xl sm:text-2xl md:text-3xl mb-2 font-bold">
          Bem-vindo ao GoMech, {name}!
        </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg">
          Gerencie seus clientes, veículos e ordens de serviço de forma
          eficiente.
        </p>

        {/* Informações sobre o usuário e suas permissões */}
        <div
          className={`mt-3 sm:mt-4 md:mt-5 p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
            role === 'ADMIN'
              ? 'bg-green-50 border-green-400 hover:border-green-500'
              : 'bg-blue-50 border-blue-400 hover:border-blue-500'
          }`}
        >
          <h3 className="m-0 mb-2 text-gray-800 font-semibold text-sm sm:text-base flex items-center gap-2">
            <span className="text-base sm:text-lg">
              {role === 'ADMIN' ? '🛡️' : '👤'}
            </span>
            {role === 'ADMIN' ? 'Administrador' : 'Usuário'}
          </h3>
          <p className="m-0 text-xs sm:text-sm text-gray-600 leading-relaxed">
            {role === 'ADMIN'
              ? 'Acesso completo ao sistema com permissões de criação, edição e exclusão de dados.'
              : 'Acesso de visualização aos dados do sistema com funcionalidades limitadas.'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 md:mt-8">
        <Link to="/clients" className="block group">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-orangeWheel-300 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-700 text-xs sm:text-sm font-medium uppercase tracking-wide m-0">
                Total de Clientes
              </h3>
              <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-200">
                👥
              </span>
            </div>
            <div className="text-orangeWheel-500 text-xl sm:text-2xl md:text-3xl font-bold m-0">
              {isLoading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 border-orangeWheel-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalClients.toLocaleString('pt-BR')
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 group-hover:text-orangeWheel-600 transition-colors duration-200">
              Clique para gerenciar clientes
            </p>
          </div>
        </Link>

        <Link to="/vehicles" className="block group">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-orangeWheel-300 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-700 text-xs sm:text-sm font-medium uppercase tracking-wide m-0">
                Veículos Cadastrados
              </h3>
              <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-200">
                🚗
              </span>
            </div>
            <div className="text-orangeWheel-500 text-xl sm:text-2xl md:text-3xl font-bold m-0">
              {isLoading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 border-orangeWheel-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalVehicles.toLocaleString('pt-BR')
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 group-hover:text-orangeWheel-600 transition-colors duration-200">
              Clique para gerenciar veículos
            </p>
          </div>
        </Link>

        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 text-xs sm:text-sm font-medium uppercase tracking-wide m-0">
              Ordens de Serviço
            </h3>
            <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-200">
              📋
            </span>
          </div>
          <div className="text-orangeWheel-500 text-xl sm:text-2xl md:text-3xl font-bold m-0">
            {isLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 border-orangeWheel-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              totalServiceOrders.toLocaleString('pt-BR')
            )}
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-1 sm:gap-3 text-xs">
            <span className="text-blue-600 flex items-center gap-1">
              <span>🔄</span> {inProgressServiceOrders} em andamento
            </span>
            <span className="text-yellow-600 flex items-center gap-1">
              <span>⏳</span> {pendingServiceOrders} pendentes
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 text-xs sm:text-sm font-medium uppercase tracking-wide m-0">
              Serviços Concluídos
            </h3>
            <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-200">
              ✅
            </span>
          </div>
          <div className="text-orangeWheel-500 text-xl sm:text-2xl md:text-3xl font-bold m-0">
            {isLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 border-orangeWheel-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              completedServiceOrders.toLocaleString('pt-BR')
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Serviços finalizados com sucesso
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 text-xs sm:text-sm font-medium uppercase tracking-wide m-0">
              Receita Total
            </h3>
            <span className="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-200">
              💰
            </span>
          </div>
          <div className="text-orangeWheel-500 text-xl sm:text-2xl md:text-3xl font-bold m-0">
            {isLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 border-orangeWheel-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              formatCurrency(revenueSummary.totalRevenue)
            )}
          </div>
          <div className="mt-3 text-xs">
            <span
              className={`flex items-center gap-1 ${
                revenueSummary.monthlyGrowth >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              <span>{revenueSummary.monthlyGrowth >= 0 ? '📈' : '📉'}</span>
              {Math.abs(revenueSummary.monthlyGrowth).toFixed(1)}% este mês
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <ChartCard
          title="Distribuição de Ordens de Serviço"
          isLoading={isLoading}
        >
          <ServiceOrderChart serviceOrders={serviceOrders} />
        </ChartCard>

        <ChartCard title="Receita dos Últimos 6 Meses" isLoading={isLoading}>
          <RevenueChart serviceOrders={serviceOrders} />
        </ChartCard>
      </div>

      {/* Sistema Info */}
      <div className="mt-8 sm:mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
          <span className="text-orangeWheel-500 text-sm">⚙️</span>
          <p className="text-xs sm:text-sm text-gray-500 m-0">
            GoMech v1.0 - Sistema de Gestão de Oficina Mecânica
          </p>
        </div>
      </div>
    </div>
  )
}
