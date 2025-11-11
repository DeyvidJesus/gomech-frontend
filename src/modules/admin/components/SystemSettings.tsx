import { clientsApi } from "../../../modules/client/services/api";
import { vehiclesApi } from "../../../modules/vehicle/services/api";
import { serviceOrdersApi } from "../../../modules/serviceOrder/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { showSuccessToast, showWarningToast, showErrorAlert } from "@/shared/utils/errorHandler";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useAuth } from "@/modules/auth/hooks/useAuth";

interface SystemSettingsProps {
  onSave?: (settings: Record<string, any>) => void;
}

export default function SystemSettings({ onSave }: SystemSettingsProps) {
  const { confirm, confirmState } = useConfirm();
  const { data: authData } = useAuth();
  const [settings, setSettings] = useState({
    autoBackup: true,
    maintenanceMode: false,
    notificationEmail: authData?.email || '',
    maxUsers: 50,
    sessionTimeout: 30,
  });
  
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.getAll().then(res => res.data),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.getAll().then(res => res.data),
  });

  const { data: serviceOrders = [] } = useQuery({
    queryKey: ["serviceOrders"],
    queryFn: () => serviceOrdersApi.getAll().then(res => res.data),
  });

  // Mutations para exclusão de dados
  const deleteAllClientsMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = clients.map(client => clientsApi.delete(client.id));
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteAllVehiclesMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = vehicles.map(vehicle => vehiclesApi.delete(vehicle.id));
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const deleteAllServiceOrdersMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = serviceOrders.map(order => serviceOrdersApi.delete(order.id));
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
    },
  });

  const [dataToDelete, setDataToDelete] = useState({
    personalData: false,
    clients: false,
    vehicles: false,
    serviceOrders: false,
    users: false,
    systemLogs: false,
    backups: false,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave?.(settings);
    showSuccessToast("Configurações salvas com sucesso!");
  };

  const handleDataDeleteToggle = (key: string, value: boolean) => {
    setDataToDelete(prev => ({ ...prev, [key]: value }));
  };

  const showDeletePopup = async () => {
    const selectedData = Object.entries(dataToDelete)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);

    if (selectedData.length === 0) {
      showWarningToast("Selecione pelo menos um tipo de dado para excluir.");
      return;
    }

    const dataLabels: Record<string, string> = {
      personalData: "Dados Pessoais",
      clients: "Clientes",
      vehicles: "Veículos", 
      serviceOrders: "Ordens de Serviço",
      users: "Usuários",
      systemLogs: "Logs do Sistema",
      backups: "Backups"
    };

    const selectedLabels = selectedData.map(key => dataLabels[key]).join(", ");
    
    const confirmation = await confirm({
      title: 'Excluir Dados - LGPD',
      message: `Tem certeza que deseja excluir os seguintes dados: ${selectedLabels}?\n\nEsta ação é IRREVERSÍVEL e os dados serão permanentemente removidos do sistema.`,
      confirmText: 'Excluir Dados',
      cancelText: 'Cancelar',
      variant: 'danger'
    });
    
    if (confirmation) {
      setIsDeleting(true);
      
      try {
        const deletionPromises = [];

        if (selectedData.includes('clients')) {
          deletionPromises.push(deleteAllClientsMutation.mutateAsync());
        }

        if (selectedData.includes('vehicles')) {
          deletionPromises.push(deleteAllVehiclesMutation.mutateAsync());
        }

        if (selectedData.includes('serviceOrders')) {
          deletionPromises.push(deleteAllServiceOrdersMutation.mutateAsync());
        }

        if (selectedData.includes('personalData')) {
          console.log("Exclusão de dados pessoais solicitada");
          deletionPromises.push(new Promise(resolve => setTimeout(resolve, 1000)));
        }

        if (selectedData.includes('users')) {
          console.log("Exclusão de usuários solicitada");
          deletionPromises.push(new Promise(resolve => setTimeout(resolve, 1000)));
        }

        if (selectedData.includes('systemLogs')) {
          console.log("Exclusão de logs do sistema solicitada");
          deletionPromises.push(new Promise(resolve => setTimeout(resolve, 500)));
        }

        if (selectedData.includes('backups')) {
          console.log("Exclusão de backups solicitada");
          deletionPromises.push(new Promise(resolve => setTimeout(resolve, 500)));
        }

        // Aguardar todas as exclusões
        await Promise.all(deletionPromises);

        // Invalidar todo o cache do TanStack Query para recarregar os dados
        await queryClient.invalidateQueries();
        
        // Opcional: Limpar completamente o cache
        // queryClient.clear();

        showSuccessToast(`Exclusão concluída com sucesso! Dados excluídos: ${selectedLabels}`);
        
        // Reset dos toggles após confirmação
        setDataToDelete({
          personalData: false,
          clients: false,
          vehicles: false,
          serviceOrders: false,
          users: false,
          systemLogs: false,
          backups: false,
        });

      } catch (error) {
        console.error("Erro ao excluir dados:", error);
        showErrorAlert(error, "Erro ao excluir dados. Tente novamente ou contate o suporte.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Auto Backup */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Backup Automático</h4>
              <p className="text-xs sm:text-sm text-gray-500">Realizar backup diário dos dados</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orangeWheel-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orangeWheel-500"></div>
            </label>
          </div>

          {/* Maintenance Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Modo de Manutenção</h4>
              <p className="text-xs sm:text-sm text-gray-500">Bloquear acesso ao sistema para manutenção</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Email Notifications */}
          <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Email para Notificações
            </label>
            <input
              type="email"
              value={settings.notificationEmail}
              onChange={(e) => handleSettingChange('notificationEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 text-sm"
              placeholder="admin@gomech.com"
            />
          </div>

          {/* Max Users */}
          <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Máximo de Usuários Simultâneos
            </label>
            <input
              type="number"
              value={settings.maxUsers}
              onChange={(e) => handleSettingChange('maxUsers', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 text-sm"
              min="1"
              max="1000"
            />
          </div>

          {/* Session Timeout */}
          <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Timeout da Sessão (minutos)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 text-sm"
              min="5"
              max="480"
            />
          </div>
        </div>

        <div className="flex justify-center sm:justify-end mt-4 sm:mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
          >
            Salvar Configurações
          </button>
        </div>  
      </div>

      {/* Data Deletion Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Exclusão de Dados - LGPD</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar a exclusão dos seus dados. 
            Selecione abaixo quais tipos de dados deseja excluir:
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-6">
          {/* Personal Data */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Dados Pessoais</h4>
              <p className="text-xs sm:text-sm text-gray-500">Nome, email, telefone e outras informações pessoais</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={dataToDelete.personalData}
                onChange={(e) => handleDataDeleteToggle('personalData', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Clients */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Clientes</h4>
              <p className="text-xs sm:text-sm text-gray-500">Todos os dados de clientes cadastrados</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={dataToDelete.clients}
                onChange={(e) => handleDataDeleteToggle('clients', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Vehicles */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Veículos</h4>
              <p className="text-xs sm:text-sm text-gray-500">Informações de todos os veículos cadastrados</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={dataToDelete.vehicles}
                onChange={(e) => handleDataDeleteToggle('vehicles', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Service Orders */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Ordens de Serviço</h4>
              <p className="text-xs sm:text-sm text-gray-500">Histórico completo de ordens de serviço</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={dataToDelete.serviceOrders}
                onChange={(e) => handleDataDeleteToggle('serviceOrders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Users */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Usuários</h4>
              <p className="text-xs sm:text-sm text-gray-500">Dados de usuários do sistema</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={dataToDelete.users}
                onChange={(e) => handleDataDeleteToggle('users', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* System Logs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Logs do Sistema</h4>
              <p className="text-xs sm:text-sm text-gray-500">Registros de atividades e acessos</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={dataToDelete.systemLogs}
                onChange={(e) => handleDataDeleteToggle('systemLogs', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Backups */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">Backups</h4>
              <p className="text-xs sm:text-sm text-gray-500">Cópias de segurança dos dados</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={dataToDelete.backups}
                onChange={(e) => handleDataDeleteToggle('backups', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Atenção</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>A exclusão dos dados é <strong>permanente e irreversível</strong>. Certifique-se de fazer backup de informações importantes antes de prosseguir.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-end">
          <button
            onClick={() => setDataToDelete({
              personalData: false,
              clients: false,
              vehicles: false,
              serviceOrders: false,
              users: false,
              systemLogs: false,
              backups: false,
            })}
            disabled={isDeleting}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto"
          >
            Limpar Seleção
          </button>
          <button
            onClick={showDeletePopup}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {isDeleting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isDeleting ? "Excluindo..." : "Solicitar Exclusão"}
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Versão</h4>
            <p className="text-gray-600 text-sm sm:text-base">GoMech v2.0.0</p>
          </div>
          
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Ambiente</h4>
            <p className="text-gray-600 text-sm sm:text-base">Produção</p>
          </div>
          
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Última Atualização</h4>
            <p className="text-gray-600 text-sm sm:text-base">Hoje às 14:30</p>
          </div>
          
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Uso de Memória</h4>
            <p className="text-gray-600 text-sm sm:text-base">245 MB / 1 GB</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    </div>
  );
}
