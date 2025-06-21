import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import AuthRoute from '@/components/AuthRoute/AuthRoute';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      router.push('/');
    } catch {
      setError('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthRoute>
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
          width: '400px' 
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Login</h2>
            
            <input 
              type="email"
              placeholder="E-mail" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            
            <input 
              type="password" 
              placeholder="Senha" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            
            {error && <span style={{ color: 'red', fontSize: '14px' }}>{error}</span>}
            
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>
                Não tem uma conta?{' '}
                <Link href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
                  Criar conta
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </AuthRoute>
  );
}
