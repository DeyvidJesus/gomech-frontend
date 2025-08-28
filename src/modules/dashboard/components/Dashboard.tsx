import ProtectedRoute from "../../auth/components/ProtectedRoute";
import { useAuth } from "../../auth/hooks/useAuth";
import { useRole } from "../../auth/hooks/useRole";
import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../../client/services/api";
import { vehiclesApi } from "../../vehicle/services/api";
import { serviceOrdersApi } from "../../serviceOrder/services/api";
import { Link } from "@tanstack/react-router";

export default function Dashboard() {
  const { data } = useAuth();
  const { canCreate, canEdit, canDelete } = useRole();

  // Buscar dados reais das APIs
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
  const completedServiceOrders = serviceOrders.filter(order => order.status === 'completed').length;
  const pendingServiceOrders = serviceOrders.filter(order => order.status === 'pending').length;
  const inProgressServiceOrders = serviceOrders.filter(order => order.status === 'in_progress').length;

  // Verificar se está carregando
  const isLoading = clientsLoading || vehiclesLoading || serviceOrdersLoading;

  const { name, role } = data || {};
  return (
    <ProtectedRoute>
      <div className="p-8 bg-gray-50 h-[80vh] rounded-lg">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-orange-600 text-3xl mb-2 font-bold">
            Bem-vindo a GoMech, {name}!
          </h1>
          <p className="text-gray-500 text-lg">
            Aqui você pode gerenciar seus clientes, veículos e ordens de serviço.
          </p>

          {/* Informações sobre o usuário e suas permissões */}
          <div className={`
          mt-5 p-4 rounded-lg border-2
          ${role === 'ADMIN'
              ? 'bg-green-50 border-green-500'
              : 'bg-blue-50 border-blue-500'
            }
        `}>
            <h3 className="m-0 mb-2 text-gray-800 font-semibold">
              {role === 'ADMIN' ? '🛡️ Administrador' : '👤 Usuário'}
            </h3>
            <p className="m-0 text-sm text-gray-600">
              {role === 'ADMIN'
                ? 'Você tem acesso completo ao sistema com permissões de criação, edição e exclusão.'
                : 'Você tem acesso de visualização aos dados do sistema.'
              }
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mt-8">
          {/* Total de Clientes */}
          <Link to="/clients" className="block">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-orange-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-700 text-sm font-medium uppercase tracking-wide m-0">
                  Total de Clientes
                </h3>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-orange-600 text-3xl font-bold m-0">
                {isLoading ? (
                  <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  totalClients.toLocaleString('pt-BR')
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Clique para gerenciar clientes
              </p>
            </div>
          </Link>

          {/* Veículos Cadastrados */}
          <Link to="/vehicles" className="block">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-orange-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-700 text-sm font-medium uppercase tracking-wide m-0">
                  Veículos Cadastrados
                </h3>
                <span className="text-2xl">🚗</span>
              </div>
              <div className="text-orange-600 text-3xl font-bold m-0">
                {isLoading ? (
                  <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  totalVehicles.toLocaleString('pt-BR')
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Clique para gerenciar veículos
              </p>
            </div>
          </Link>

          {/* Ordens de Serviço */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 text-sm font-medium uppercase tracking-wide m-0">
                Ordens de Serviço
              </h3>
              <span className="text-2xl">📋</span>
            </div>
            <div className="text-orange-600 text-3xl font-bold m-0">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalServiceOrders.toLocaleString('pt-BR')
              )}
            </div>
            <div className="mt-2 flex gap-4 text-xs">
              <span className="text-blue-600">
                🔄 {inProgressServiceOrders} em andamento
              </span>
              <span className="text-yellow-600">
                ⏳ {pendingServiceOrders} pendentes
              </span>
            </div>
          </div>

          {/* Serviços Concluídos */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 text-sm font-medium uppercase tracking-wide m-0">
                Serviços Concluídos
              </h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-orange-600 text-3xl font-bold m-0">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                completedServiceOrders.toLocaleString('pt-BR')
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {totalServiceOrders > 0 
                ? `${((completedServiceOrders / totalServiceOrders) * 100).toFixed(1)}% de conclusão`
                : 'Nenhum serviço registrado'
              }
            </p>
          </div>
        </div>

        {/* Dados Recentes */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clientes Recentes */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">👥 Clientes Recentes</h3>
              <Link 
                to="/clients" 
                className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
              >
                Ver todos →
              </Link>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : clients.length > 0 ? (
              <div className="space-y-3">
                {clients.slice(-5).reverse().map((client) => (
                  <Link 
                    key={client.id}
                    to="/clients/$id"
                    params={{ id: client.id.toString() }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{client.name}</div>
                      <div className="text-sm text-gray-500 truncate">{client.email}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📝</span>
                <p>Nenhum cliente cadastrado ainda</p>
                {canCreate && (
                  <Link 
                    to="/clients" 
                    className="text-orange-600 hover:text-orange-700 font-medium mt-2 inline-block"
                  >
                    Cadastrar primeiro cliente
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Veículos Recentes */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🚗 Veículos Recentes</h3>
              <Link 
                to="/vehicles" 
                className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
              >
                Ver todos →
              </Link>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length > 0 ? (
              <div className="space-y-3">
                {vehicles.slice(-5).reverse().map((vehicle) => (
                  <Link 
                    key={vehicle.id}
                    to="/vehicles/$id"
                    params={{ id: vehicle.id.toString() }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600">🚗</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {vehicle.brand} {vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {vehicle.licensePlate} • {vehicle.color}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">🚗</span>
                <p>Nenhum veículo cadastrado ainda</p>
                {canCreate && (
                  <Link 
                    to="/vehicles" 
                    className="text-orange-600 hover:text-orange-700 font-medium mt-2 inline-block"
                  >
                    Cadastrar primeiro veículo
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Painel de Permissões */}
        <div className="mt-8 p-5 bg-white rounded-lg shadow-sm">
          <h2 className="text-gray-800 mb-5 text-xl font-semibold">📋 Suas Permissões</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {canCreate ? '✅' : '❌'}
              </div>
              <div className={`text-sm ${canCreate ? 'text-green-500' : 'text-red-500'}`}>
                Criar
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">
                {canEdit ? '✅' : '❌'}
              </div>
              <div className={`text-sm ${canEdit ? 'text-green-500' : 'text-red-500'}`}>
                Editar
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">
                {canDelete ? '✅' : '❌'}
              </div>
              <div className={`text-sm ${canDelete ? 'text-green-500' : 'text-red-500'}`}>
                Excluir
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">
                ✅
              </div>
              <div className="text-sm text-green-500">
                Visualizar
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
