import axios from "axios";

const chatApi = axios.create({
  baseURL: 'http://localhost:5080',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

chatApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

export const aiService = {
  chat: (data: Record<string, unknown>) => chatApi.post('/ai/chat', data),
}