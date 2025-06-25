import axios from 'axios';

// Criar instância do axios com configuração base
const api = axios.create({
  baseURL: 'https://clear-ellene-deyvidgondim-8b8a208e.koyeb.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar token nas requisições
api.interceptors.request.use(
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

// Interceptador para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Sem permissão
      console.error('Acesso negado:', error.response.data);
      
      // Você pode usar um sistema de notificações aqui
      // toast.error('Você não tem permissão para realizar esta ação');
      
      // Ou mostrar um alert simples
      alert('Você não tem permissão para realizar esta ação');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Funções auxiliares para diferentes tipos de requisições
export const apiService = {
  // Clientes
  clients: {
    getAll: () => api.get('/clients'),
    getById: (id: number) => api.get(`/clients/${id}`),
    create: (data: Record<string, unknown>) => api.post('/clients', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/clients/${id}`, data),
    delete: (id: number) => api.delete(`/clients/${id}`),
  },
  
  // Veículos
  vehicles: {
    getAll: () => api.get('/vehicles'),
    getById: (id: number) => api.get(`/vehicles/${id}`),
    create: (data: Record<string, unknown>) => api.post('/vehicles', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/vehicles/${id}`, data),
    delete: (id: number) => api.delete(`/vehicles/${id}`),
  },
  
  // Ordens de Serviço
  serviceOrders: {
    getAll: () => api.get('/service-orders'),
    getById: (id: number) => api.get(`/service-orders/${id}`),
    create: (data: Record<string, unknown>) => api.post('/service-orders', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/service-orders/${id}`, data),
    delete: (id: number) => api.delete(`/service-orders/${id}`),
  },
  
  // Autenticação
  auth: {
    login: (email: string, password: string) => 
      api.post('/auth/login', { email, password }),
    register: (name: string, email: string, password: string, roleId: number) =>
      api.post('/auth/register', { name, email, password, roleId }),
  },
}; 
