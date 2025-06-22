import { useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import Topbar from '@/components/Topbar/Topbar';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Container, Main } from '../../styles/globals';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Container>
        <Sidebar />
        <Main>
          <Topbar title="Administração" page="admin" isSearchable={false} />
          
          <div style={{ padding: '20px' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>
                🛡️ Painel Administrativo
              </h2>
              
              <p style={{ color: '#666', marginBottom: '30px' }}>
                Bem-vindo ao painel administrativo, <strong>{user?.email}</strong>! 
                Esta área é restrita apenas para usuários com permissão de ADMIN.
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px' 
              }}>
                {/* Card de Usuários */}
                <div style={{
                  backgroundColor: '#3498db',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3>👥 Usuários</h3>
                  <p>Gerenciar usuários do sistema</p>
                  <button style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Gerenciar
                  </button>
                </div>
                
                {/* Card de Configurações */}
                <div style={{
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3>⚙️ Configurações</h3>
                  <p>Configurações do sistema</p>
                  <button style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Configurar
                  </button>
                </div>
                
                {/* Card de Relatórios */}
                <div style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3>📊 Relatórios</h3>
                  <p>Relatórios e estatísticas</p>
                  <button style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Ver Relatórios
                  </button>
                </div>
                
                {/* Card de Logs */}
                <div style={{
                  backgroundColor: '#f39c12',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3>📋 Logs</h3>
                  <p>Auditoria e logs do sistema</p>
                  <button style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Ver Logs
                  </button>
                </div>
              </div>
            </div>
            
            {/* Informações de Role */}
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ color: '#495057', marginBottom: '15px' }}>
                ℹ️ Informações do Sistema de Roles
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ color: '#6c757d' }}>Usuário Atual:</h4>
                  <ul style={{ color: '#495057' }}>
                    <li>Email: {user?.email}</li>
                    <li>Role: {user?.role}</li>
                    <li>ID: {user?.id}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 style={{ color: '#6c757d' }}>Permissões ADMIN:</h4>
                  <ul style={{ color: '#495057' }}>
                    <li>✅ Criar registros</li>
                    <li>✅ Editar registros</li>
                    <li>✅ Excluir registros</li>
                    <li>✅ Visualizar registros</li>
                    <li>✅ Acessar administração</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Main>
      </Container>
    </ProtectedRoute>
  );
} 
