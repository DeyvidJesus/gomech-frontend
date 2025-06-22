import { useAuth, useRole } from '@/context/AuthContext';
import { DashboardContainer, WelcomeMessage, StatsGrid, StatCard, Title, Value } from './styles';

export default function Dashboard() {
  const { user } = useAuth();
  const { canCreate, canEdit, canDelete } = useRole();

  return (
    <DashboardContainer>
      <WelcomeMessage>
        <h1>Bem-vindo ao GoMech, {user?.email}!</h1>
        <p>Aqui você pode gerenciar seus clientes, veículos e ordens de serviço.</p>
        
        {/* Informações sobre o usuário e suas permissões */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: user?.role === 'ADMIN' ? '#e8f5e8' : '#e8f4fd',
          borderRadius: '8px',
          border: `2px solid ${user?.role === 'ADMIN' ? '#2ecc71' : '#3498db'}`
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
            {user?.role === 'ADMIN' ? '🛡️ Administrador' : '👤 Usuário'}
          </h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            {user?.role === 'ADMIN' 
              ? 'Você tem acesso completo ao sistema com permissões de criação, edição e exclusão.'
              : 'Você tem acesso de visualização aos dados do sistema.'
            }
          </p>
        </div>
      </WelcomeMessage>
      
      <StatsGrid>
        <StatCard>
          <Title>Total de Clientes</Title>
          <Value>0</Value>
        </StatCard>
        
        <StatCard>
          <Title>Veículos Cadastrados</Title>
          <Value>0</Value>
        </StatCard>
        
        <StatCard>
          <Title>Ordens de Serviço</Title>
          <Value>0</Value>
        </StatCard>
        
        <StatCard>
          <Title>Serviços Concluídos</Title>
          <Value>0</Value>
        </StatCard>
      </StatsGrid>
      
      {/* Painel de Permissões */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>📋 Suas Permissões</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {canCreate() ? '✅' : '❌'}
            </div>
            <div style={{ fontSize: '14px', color: canCreate() ? '#2ecc71' : '#e74c3c' }}>
              Criar
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {canEdit() ? '✅' : '❌'}
            </div>
            <div style={{ fontSize: '14px', color: canEdit() ? '#2ecc71' : '#e74c3c' }}>
              Editar
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {canDelete() ? '✅' : '❌'}
            </div>
            <div style={{ fontSize: '14px', color: canDelete() ? '#2ecc71' : '#e74c3c' }}>
              Excluir
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              ✅
            </div>
            <div style={{ fontSize: '14px', color: '#2ecc71' }}>
              Visualizar
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
} 
