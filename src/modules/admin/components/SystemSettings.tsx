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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
        
        <div className="space-y-4">
          {/* Auto Backup */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Backup Automático</h4>
              <p className="text-sm text-gray-500">Realizar backup diário dos dados</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Modo de Manutenção</h4>
              <p className="text-sm text-gray-500">Bloquear acesso ao sistema para manutenção</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
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
          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email para Notificações
            </label>
            <input
              type="email"
              value={settings.notificationEmail}
              onChange={(e) => handleSettingChange('notificationEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="admin@gomech.com"
            />
          </div>

          {/* Max Users */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Usuários Simultâneos
            </label>
            <input
              type="number"
              value={settings.maxUsers}
              onChange={(e) => handleSettingChange('maxUsers', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min="1"
              max="1000"
            />
          </div>

          {/* Session Timeout */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout da Sessão (minutos)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min="5"
              max="480"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Salvar Configurações
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Versão</h4>
            <p className="text-gray-600">GoMech v2.0.0</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Ambiente</h4>
            <p className="text-gray-600">Produção</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Última Atualização</h4>
            <p className="text-gray-600">Hoje às 14:30</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Uso de Memória</h4>
            <p className="text-gray-600">245 MB / 1 GB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
