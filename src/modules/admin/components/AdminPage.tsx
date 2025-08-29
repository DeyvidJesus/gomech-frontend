import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import { clientsApi } from "../../client/services/api";
import { vehiclesApi } from "../../vehicle/services/api";
import { serviceOrdersApi } from "../../serviceOrder/services/api";
import ProtectedRoute from "../../auth/components/ProtectedRoute";
import RoleGuard from "../../auth/components/RoleGuard";
import SystemSettings from "./SystemSettings";
import VehicleClientStats from "./VehicleClientStats";

export default function AdminPage() {
  const { data: authData } = useAuth();
  // const { canCreate, canEdit, canDelete } = useRole(); // Não utilizado no momento
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'reports'>('overview');

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

  const isLoading = clientsLoading || vehiclesLoading || serviceOrdersLoading;

  // Cálculos de estatísticas
  const totalRevenue = serviceOrders
    .filter(order => order.status === 'COMPLETED')
    .reduce((sum, order) => sum + (order.finalCost || 0), 0);

  const pendingOrders = serviceOrders.filter(order => order.status === 'PENDING').length;
  const inProgressOrders = serviceOrders.filter(order => order.status === 'IN_PROGRESS').length;
  
  const completedThisMonth = serviceOrders.filter(order => {
    if (!order.actualCompletion) return false;
    const completed = new Date(order.actualCompletion);
    const now = new Date();
    return completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear();
  }).length;

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'users', label: 'Usuários', icon: '👥' },
    { id: 'system', label: 'Sistema', icon: '⚙️' },
    { id: 'reports', label: 'Relatórios', icon: '📈' }
  ] as const;

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <div className="p-8 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-700 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">⚡</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600">Gerencie o sistema GoMech</p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {authData?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bem-vindo, {authData?.name}</p>
                  <p className="text-sm text-gray-500">Função: {authData?.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : clients.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Veículos</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : vehicles.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🚗</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">OS em Andamento</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : pendingOrders + inProgressOrders}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita Total</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : `R$ ${totalRevenue.toLocaleString('pt-BR')}`}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle-Client Stats and Quick Actions */}
              <VehicleClientStats />

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📊</span>
                        <div>
                          <p className="font-medium">Gerar Relatório de Vendas</p>
                          <p className="text-sm text-gray-500">Relatório completo do mês atual</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🧹</span>
                        <div>
                          <p className="font-medium">Limpar Cache do Sistema</p>
                          <p className="text-sm text-gray-500">Otimizar performance</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📤</span>
                        <div>
                          <p className="font-medium">Backup dos Dados</p>
                          <p className="text-sm text-gray-500">Criar backup manual</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas do Mês</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">OS Concluídas</span>
                      <span className="font-semibold text-green-600">{completedThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">OS Pendentes</span>
                      <span className="font-semibold text-yellow-600">{pendingOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">OS em Progresso</span>
                      <span className="font-semibold text-blue-600">{inProgressOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de OS</span>
                      <span className="font-semibold text-gray-900">{serviceOrders.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gerenciamento de Usuários</h3>
              <div className="text-center py-8">
                <span className="text-4xl">👷‍♂️</span>
                <p className="text-gray-500 mt-2">Funcionalidade em desenvolvimento</p>
                <p className="text-sm text-gray-400">Em breve você poderá gerenciar usuários aqui</p>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <SystemSettings onSave={(settings) => console.log('Configurações salvas:', settings)} />
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios e Analytics</h3>
              <div className="text-center py-8">
                <span className="text-4xl">📈</span>
                <p className="text-gray-500 mt-2">Relatórios em desenvolvimento</p>
                <p className="text-sm text-gray-400">Em breve você terá acesso a relatórios detalhados</p>
              </div>
            </div>
          )}
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
