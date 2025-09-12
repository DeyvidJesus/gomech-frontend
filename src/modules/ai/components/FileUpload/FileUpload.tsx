import { useState, useRef } from 'react';
import { fileUploadService } from '../../services/fileUploadApi';

interface FileUploadProps {
  onUploadSuccess?: (message: string, documentsProcessed: number) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['.json', '.csv', '.xlsx', '.xls'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    // Validações
    if (file.size > maxFileSize) {
      onUploadError?.('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      onUploadError?.(`Formato não suportado. Use: ${supportedFormats.join(', ')}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simula progresso do upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fileUploadService.uploadFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.status === 'success') {
        onUploadSuccess?.(response.message, response.documentsProcessed);
      } else {
        onUploadError?.(response.message || 'Erro no upload');
      }

    } catch (error: any) {
      console.error('Erro no upload:', error);
      onUploadError?.(error.response?.data?.message || 'Erro no upload do arquivo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const clearData = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os dados indexados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await fileUploadService.clearData();
      onUploadSuccess?.('Dados limpos com sucesso', 0);
    } catch (error: any) {
      onUploadError?.(error.response?.data?.message || 'Erro ao limpar dados');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          📁 Upload de Dados
        </h3>
        <p className="text-sm text-gray-600">
          Envie arquivos para enriquecer a base de conhecimento da IA
        </p>
      </div>

      {/* Área de Upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="text-blue-600">
              <svg className="animate-spin h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Processando arquivo...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 cursor-pointer hover:underline">
                  Clique para selecionar
                </span>
                {' '}ou arraste arquivos aqui
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Formatos: {supportedFormats.join(', ')} • Máx: 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação */}      <div className="mt-6 flex gap-3">
        <button
          onClick={clearData}
          disabled={isUploading}
          className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🗑️ Limpar Dados
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📂 Selecionar Arquivo
        </button>
      </div>

      {/* Informações */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-800 mb-2">💡 Dicas:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• JSON: Array de objetos ou objeto único</li>
          <li>• CSV: Primeira linha como cabeçalho</li>
          <li>• Excel: Primeira aba, primeira linha como cabeçalho</li>
          <li>• Os dados serão indexados e ficarão disponíveis para a IA</li>
        </ul>
      </div>
    </div>
  );
}