import type { SessionData } from "../../../shared/types/sessionData";
import axios from "axios";

const chatApi = axios.create({
  // baseURL: "http://localhost:5080",
  baseURL: "https://api.gomech.com.br",
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

chatApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const sessionDataString = localStorage.getItem("REACT_QUERY_OFFLINE_CACHE");
      const sessionData: SessionData | null = sessionDataString ? JSON.parse(sessionDataString) : null;
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

chatApi.interceptors.response.use(
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

interface ChatRequest {
  prompt: string;
  includeChart?: boolean;
  threadId?: string;
  userId?: number;
}

export const aiService = {
  chat: (data: ChatRequest) => chatApi.post('/ai/chat', data),
  status: () => chatApi.get('/ai/chat/status'),
}
