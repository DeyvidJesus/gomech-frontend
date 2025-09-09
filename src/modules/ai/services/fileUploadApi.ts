import axios from 'axios';

const fileUploadApi = axios.create({
  baseURL: "https://clear-ellene-deyvidgondim-8b8a208e.koyeb.app",
  timeout: 300000, // 5 minutos para upload de arquivos grandes
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Interceptors para autenticação
fileUploadApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const sessionDataString = localStorage.getItem("REACT_QUERY_OFFLINE_CACHE");
      const sessionData = sessionDataString ? JSON.parse(sessionDataString) : null;
      const fallbackToken = sessionData?.clientState?.queries?.find(
        (q: any) => q.queryKey[0] === "auth"
      )?.state?.data?.token;
      if (fallbackToken) {
        config.headers.Authorization = `Bearer ${fallbackToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

fileUploadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Acesso negado:', error.response.data);
      alert('Você não tem permissão para realizar esta ação');
    }

    return Promise.reject(error);
  }
);

interface FileUploadResponse {
  status: string;
  message: string;
  documentsProcessed: number;
}

interface IngestionStatus {
  status: string;
  ai_status: {
    enhanced_ai: boolean;
    database_connection: boolean;
    embeddings: boolean;
    rag_system: boolean;
  };
  message: string;
}

export const fileUploadService = {
  /**
   * Upload de arquivo para ingestão
   */
  uploadFile: async (file: File, collectionName?: string): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (collectionName) {
      formData.append('collectionName', collectionName);
    }

    const response = await fileUploadApi.post('/api/files/upload', formData);
    return response.data;
  },

  /**
   * Limpa todos os dados indexados
   */
  clearData: async (): Promise<{ status: string; message: string }> => {
    const response = await fileUploadApi.post('/api/files/clear');
    return response.data;
  },

  /**
   * Obtém status da ingestão
   */
  getIngestionStatus: async (): Promise<IngestionStatus> => {
    const response = await fileUploadApi.get('/api/files/status');
    return response.data;
  },

  /**
   * Upload com progresso (para arquivos grandes)
   */
  uploadFileWithProgress: async (
    file: File, 
    onProgress?: (progress: number) => void,
    collectionName?: string
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (collectionName) {
      formData.append('collectionName', collectionName);
    }

    const response = await fileUploadApi.post('/api/files/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(progress);
        }
      }
    });

    return response.data;
  }
};
