import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { apiService } from '@/services/api';

interface User {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isAuthenticated: false,
  login: async () => { },
  register: async () => { },
  logout: () => { },
  loading: true
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
      } catch {
        // Se não conseguir fazer parse do usuário, limpar os dados
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    try {
      console.log('🔐 Tentando fazer login...', { email });

      const response = await fetch('http://localhost:5080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);

        if (response.status === 401) {
          throw new Error('Email ou senha incorretos');
        } else if (response.status === 403) {
          throw new Error('Acesso negado');
        } else {
          throw new Error(`Erro ${response.status}: ${errorText || 'Erro desconhecido'}`);
        }
      }

      const data = await response.json();
      console.log('✅ Dados recebidos:', data);

      const userData: User = {
        id: data.userId,
        email: data.email,
        role: data.role
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('🎉 Login realizado com sucesso!', userData);

    } catch (error: unknown) {
      console.error('🚨 Erro no login:', error);
      throw error;
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      console.log('📝 Tentando registrar usuário...', { name, email });

      const defaultRoleId = 2;

      const response = await fetch('http://localhost:5080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, roleId: defaultRoleId })
      });

      console.log('📡 Resposta do registro:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro no registro:', errorText);

        if (response.status === 409) {
          throw new Error('Este email já está cadastrado');
        } else if (response.status === 400) {
          throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
        } else {
          throw new Error(`Erro ${response.status}: ${errorText || 'Erro desconhecido'}`);
        }
      }

      const data = await response.json();
      console.log('✅ Registro realizado:', data);

      const userData: User = {
        id: data.userId,
        email: data.email,
        role: data.role || 'USER'
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('🎉 Registro realizado com sucesso!', userData);

    } catch (error: unknown) {
      console.error('🚨 Erro no registro:', error);
      throw error;
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('👋 Logout realizado');
  }

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuthenticated,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

// Hook específico para roles
export function useRole() {
  const { user } = useAuth();

  const isAdmin = () => user?.role === 'ADMIN';
  const isUser = () => user?.role === 'USER';
  const canCreate = () => isAdmin();
  const canEdit = () => isAdmin();
  const canDelete = () => isAdmin();
  const canView = () => isAdmin() || isUser();

  return {
    isAdmin,
    isUser,
    canCreate,
    canEdit,
    canDelete,
    canView,
    role: user?.role
  };
}
