import { useState } from "react";

interface SystemSettingsProps {
  onSave?: (settings: Record<string, any>) => void;
}

export default function SystemSettings({ onSave }: SystemSettingsProps) {
  const [settings, setSettings] = useState({
    autoBackup: true,
    maintenanceMode: false,
    notificationEmail: "admin@gomech.com",
    maxUsers: 50,
    sessionTimeout: 30,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave?.(settings);
    // Aqui seria feita a chamada para salvar as configurações
    alert("Configurações salvas com sucesso!");
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
    </div>
  );
}
