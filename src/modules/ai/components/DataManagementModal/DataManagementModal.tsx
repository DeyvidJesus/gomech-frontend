import { useState, useEffect } from 'react';
import FileUpload from '../FileUpload/FileUpload';
import { fileUploadService } from '../../services/fileUploadApi';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataManagementModal({ isOpen, onClose }: DataManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'status'>('upload');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'status') {
      loadSystemStatus();
    }
  }, [isOpen, activeTab]);

  const loadSystemStatus = async () => {
    setLoadingStatus(true);
    try {
      const status = await fileUploadService.getIngestionStatus();
      setSystemStatus(status);
    } catch (error: any) {
      console.error('Erro ao carregar status:', error);
      showNotification('error', 'Erro ao carregar status do sistema');
    } finally {
      setLoadingStatus(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadSuccess = (message: string, documentsProcessed: number) => {
    showNotification('success', `${message} (${documentsProcessed} documentos processados)`);
    if (activeTab === 'status') {
      loadSystemStatus(); // Atualiza status após upload
    }
  };

  const handleUploadError = (error: string) => {
    showNotification('error', error);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📊 Gerenciamento de Dados</h2>
              <p className="text-blue-100 mt-1">
                Gerencie os dados que alimentam a inteligência artificial
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 space-x-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600'
                  : 'text-blue-100 hover:bg-white/20'
              }`}
            >
              📁 Upload de Dados
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'status'
                  ? 'bg-white text-blue-600'
                  : 'text-blue-100 hover:bg-white/20'
              }`}
            >
              📊 Status do Sistema
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? '✅' : '❌'}
              <span className="ml-2">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Envie Novos Dados para a IA
                </h3>
                <p className="text-gray-600 mb-6">
                  Os arquivos enviados serão processados e indexados, tornando-se disponíveis 
                  para consultas da inteligência artificial.
                </p>
              </div>

              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-800 font-medium mb-2">ℹ️ Informações Importantes</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Os dados enviados complementam os dados existentes do sistema</li>
                  <li>• A IA usará tanto dados padrão quanto dados enviados por você</li>
                  <li>• Arquivos grandes podem levar alguns minutos para processar</li>
                  <li>• Dados duplicados são automaticamente filtrados</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Status do Sistema de IA
                </h3>
                <button
                  onClick={loadSystemStatus}
                  disabled={loadingStatus}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loadingStatus ? '🔄 Atualizando...' : '🔄 Atualizar'}
                </button>
              </div>

              {loadingStatus ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando status...</p>
                </div>
              ) : systemStatus ? (
                <div className="grid gap-4">
                  {/* Status Principal */}
                  <div className={`p-4 rounded-lg border ${
                    systemStatus.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h4 className="font-medium mb-2">
                      {systemStatus.status === 'success' ? '✅ Sistema Operacional' : '❌ Sistema com Problemas'}
                    </h4>
                    <p className="text-sm text-gray-600">{systemStatus.message}</p>
                  </div>

                  {/* Status Detalhado */}
                  {systemStatus.ai_status && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <StatusCard
                        title="🧠 IA Aprimorada"
                        status={systemStatus.ai_status.enhanced_ai}
                        description="Sistema de IA com RAG"
                      />
                      <StatusCard
                        title="🗄️ Base de Dados"
                        status={systemStatus.ai_status.database_connection}
                        description="Conexão com PostgreSQL"
                      />
                      <StatusCard
                        title="🔍 Embeddings"
                        status={systemStatus.ai_status.embeddings}
                        description="Sistema de vetorização"
                      />
                      <StatusCard
                        title="🤖 Sistema RAG"
                        status={systemStatus.ai_status.rag_system}
                        description="Busca e geração aumentada"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Clique em "Atualizar" para carregar o status do sistema
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, status, description }: {
  title: string;
  status: boolean;
  description: string;
}) {
  return (
    <div className={`p-4 rounded-lg border ${
      status 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium">{title}</h5>
        <span className={`text-sm px-2 py-1 rounded ${
          status
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {status ? 'OK' : 'ERRO'}
        </span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
