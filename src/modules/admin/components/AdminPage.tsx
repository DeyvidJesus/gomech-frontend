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
import AnalyticsPanel from "./AnalyticsPanel";
import AuditPanel from "./AuditPanel";

export default function AdminPage() {
  const { data: authData } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'analytics' | 'audit'>('overview');

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

  const totalRevenue = serviceOrders
    .filter(order => order.status === 'COMPLETED')
    .reduce((sum, order) => sum + (order.totalCost || 0), 0);

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
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'audit', label: 'Auditoria', icon: '🔒' }
  ] as const;

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orangeWheel-500 to-orangeWheel-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl text-white">⚡</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600 text-sm sm:text-base">Gerencie o sistema GoMech</p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orangeWheel-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orangeWheel-600 font-semibold text-sm sm:text-base">
                    {authData?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Bem-vindo, {authData?.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Função: {authData?.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 sm:mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex flex-wrap gap-2 sm:gap-0 sm:space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-orangeWheel-500 text-orangeWheel-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-1 sm:mr-2">{tab.icon}</span>
                    <span className="hidden xs:inline">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total de Clientes</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : clients.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-2xl">👥</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total de Veículos</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : vehicles.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-2xl">🚗</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">OS em Andamento</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : pendingOrders + inProgressOrders}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-2xl">⚡</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Receita Total</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {isLoading ? '...' : `R$ ${totalRevenue.toLocaleString('pt-BR')}`}
                      </p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orangeWheel-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-2xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle-Client Stats and Quick Actions */}
              <VehicleClientStats />

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg sm:text-xl flex-shrink-0">📊</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">Gerar Relatório de Vendas</p>
                          <p className="text-xs sm:text-sm text-gray-500">Relatório completo do mês atual</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg sm:text-xl flex-shrink-0">🧹</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">Limpar Cache do Sistema</p>
                          <p className="text-xs sm:text-sm text-gray-500">Otimizar performance</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg sm:text-xl flex-shrink-0">📤</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">Backup dos Dados</p>
                          <p className="text-xs sm:text-sm text-gray-500">Criar backup manual</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Estatísticas do Mês</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">OS Concluídas</span>
                      <span className="font-semibold text-green-600 text-sm sm:text-base">{completedThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">OS Pendentes</span>
                      <span className="font-semibold text-yellow-600 text-sm sm:text-base">{pendingOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">OS em Progresso</span>
                      <span className="font-semibold text-blue-600 text-sm sm:text-base">{inProgressOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Total de OS</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{serviceOrders.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Gerenciamento de Usuários</h3>
              <div className="text-center py-6 sm:py-8">
                <span className="text-3xl sm:text-4xl">👷‍♂️</span>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">Funcionalidade em desenvolvimento</p>
                <p className="text-xs sm:text-sm text-gray-400">Em breve você poderá gerenciar usuários aqui</p>
              </div>
            </div>
          )}

          {activeTab === 'system' && <SystemSettings onSave={() => undefined} />}

          {activeTab === 'analytics' && <AnalyticsPanel />}

          {activeTab === 'audit' && <AuditPanel />}
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
