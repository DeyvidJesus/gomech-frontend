import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../../client/services/api";
import { vehiclesApi } from "../../vehicle/services/api";
import { serviceOrdersApi } from "../../serviceOrder/services/api";
import ProtectedRoute from "../../auth/components/ProtectedRoute";
import { useAuth } from "../../auth/hooks/useAuth";

export default function Dashboard() {
  const { data } = useAuth();

  // Buscar dados para estatísticas
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.getAll().then(res => res.data),
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.getAll().then(res => res.data),
  });

  const { data: serviceOrders = [], isLoading: serviceOrdersLoading } = useQuery({
    queryKey: ["serviceOrders"],
    queryFn: () => serviceOrdersApi.getAll().then(res => res.data),
  });

  // Calcular estatísticas
  const totalClients = clients.length;
  const totalVehicles = vehicles.length;
  const totalServiceOrders = serviceOrders.length;
  const completedServiceOrders = serviceOrders.filter(order => order.status === 'COMPLETED').length;
  const pendingServiceOrders = serviceOrders.filter(order => order.status === 'PENDING').length;
  const inProgressServiceOrders = serviceOrders.filter(order => order.status === 'IN_PROGRESS').length;

  // Verificar se está carregando
  const isLoading = clientsLoading || vehiclesLoading || serviceOrdersLoading;

  const { name, role } = data || {};
  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-[80vh] rounded-lg">
        {/* Welcome Message */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-orange-600 text-2xl sm:text-3xl mb-2 font-bold">
            Bem-vindo a GoMech, {name}!
          </h1>
          <p className="text-gray-500 text-base sm:text-lg">
            Aqui você pode gerenciar seus clientes, veículos e ordens de serviço.
          </p>

          {/* Informações sobre o usuário e suas permissões */}
          <div className={`
          mt-4 sm:mt-5 p-3 sm:p-4 rounded-lg border-2
          ${role === 'ADMIN'
              ? 'bg-green-50 border-green-500'
              : 'bg-blue-50 border-blue-500'
            }
        `}>
            <h3 className="m-0 mb-2 text-gray-800 font-semibold text-sm sm:text-base">
              {role === 'ADMIN' ? '🛡️ Administrador' : '👤 Usuário'}
            </h3>
            <p className="m-0 text-xs sm:text-sm text-gray-600">
              {role === 'ADMIN'
                ? 'Você tem acesso completo ao sistema com permissões de criação, edição e exclusão.'
                : 'Você tem acesso de visualização aos dados do sistema.'
              }
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {/* Total de Clientes */}
          <Link to="/clients" className="block">
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-orange-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-700 text-xs sm:text-sm font-medium uppercase tracking-wide m-0">
                  Total de Clientes
                </h3>
                <span className="text-xl sm:text-2xl">👥</span>
              </div>
              <div className="text-orange-600 text-2xl sm:text-3xl font-bold m-0">
                {isLoading ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  totalClients.toLocaleString('pt-BR')
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Clique para gerenciar clientes
              </p>
            </div>
          </Link>

          {/* Veículos Cadastrados */}
          <Link to="/vehicles" className="block">
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-orange-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-700 text-xs sm:text-sm font-medium uppercase tracking-wide m-0">
                  Veículos Cadastrados
                </h3>
                <span className="text-xl sm:text-2xl">🚗</span>
              </div>
              <div className="text-orange-600 text-2xl sm:text-3xl font-bold m-0">
                {isLoading ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  totalVehicles.toLocaleString('pt-BR')
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Clique para gerenciar veículos
              </p>
            </div>
          </Link>

          {/* Ordens de Serviço */}
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 text-xs sm:text-sm font-medium uppercase tracking-wide m-0">
                Ordens de Serviço
              </h3>
              <span className="text-xl sm:text-2xl">📋</span>
            </div>
            <div className="text-orange-600 text-2xl sm:text-3xl font-bold m-0">
              {isLoading ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalServiceOrders.toLocaleString('pt-BR')
              )}
            </div>
            <div className="mt-2 flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs">
              <span className="text-blue-600">
                🔄 {inProgressServiceOrders} em andamento
              </span>
              <span className="text-yellow-600">
                ⏳ {pendingServiceOrders} pendentes
              </span>
            </div>
          </div>

          {/* Serviços Concluídos */}
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 text-xs sm:text-sm font-medium uppercase tracking-wide m-0">
                Serviços Concluídos
              </h3>
              <span className="text-xl sm:text-2xl">✅</span>
            </div>
            <div className="text-orange-600 text-2xl sm:text-3xl font-bold m-0">
              {isLoading ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                completedServiceOrders.toLocaleString('pt-BR')
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Serviços finalizados
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Cliente */}
            <Link to="/clients" className="block">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-blue-800 font-semibold text-base sm:text-lg">Gerenciar Clientes</h3>
                    <p className="text-blue-600 text-xs sm:text-sm">Adicionar, editar ou visualizar clientes</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Veículos */}
            <Link to="/vehicles" className="block">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">🚗</span>
                  </div>
                  <div>
                    <h3 className="text-green-800 font-semibold text-base sm:text-lg">Gerenciar Veículos</h3>
                    <p className="text-green-600 text-xs sm:text-sm">Adicionar, editar ou visualizar veículos</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Ordens de Serviço */}
            <Link to="/service-orders" className="block sm:col-span-2 lg:col-span-1">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-orange-800 font-semibold text-base sm:text-lg">Ordens de Serviço</h3>
                    <p className="text-orange-600 text-xs sm:text-sm">Criar e gerenciar ordens de serviço</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Resumo do Sistema</h2>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                  {isLoading ? '...' : totalClients}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Clientes Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                  {isLoading ? '...' : totalVehicles}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Veículos Cadastrados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
                  {isLoading ? '...' : totalServiceOrders}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Ordens de Serviço</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sistema Info */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            GoMech v1.0 - Sistema de Gestão de Oficina Mecânica
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
