import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import RoleGuard from '@/components/RoleGuard/RoleGuard';
import { Aside, Nav, MenuItem, MenuItemLink } from './styles';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Aside>
      <Image src="/logo.svg" alt="GoMech" width={80} height={80} />
      
      {/* Informações do usuário */}
      {user && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '8px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.8)'
        }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>{user.email}</strong>
          </div>
          <div style={{ 
            display: 'inline-block',
            padding: '2px 8px',
            backgroundColor: user.role === 'ADMIN' ? '#e74c3c' : '#3498db',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {user.role[0]}
          </div>
        </div>
      )}
      
      <Nav>
        <MenuItem><MenuItemLink href="/">Dashboard</MenuItemLink></MenuItem>
        <MenuItem><MenuItemLink href="/clientes">Clientes</MenuItemLink></MenuItem>
        <MenuItem><MenuItemLink href="/veiculos">Veículos</MenuItemLink></MenuItem>
        <MenuItem><MenuItemLink href="/os">Ordens de Serviço</MenuItemLink></MenuItem>
        
        {/* Menus administrativos apenas para ADMIN */}
        <RoleGuard roles={['ADMIN']}>
          <MenuItem><MenuItemLink href="/admin">Administração</MenuItemLink></MenuItem>
          <MenuItem><MenuItemLink href="/configuracoes">Configurações</MenuItemLink></MenuItem>
        </RoleGuard>
        
        {/* Separador visual */}
        <div style={{ 
          height: '1px', 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          margin: '20px 0' 
        }} />
        
        <MenuItem>
          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 'inherit',
              padding: '0',
              textAlign: 'left',
              width: '100%'
            }}
          >
            Sair
          </button>
        </MenuItem>
      </Nav>
    </Aside>
  );
}
