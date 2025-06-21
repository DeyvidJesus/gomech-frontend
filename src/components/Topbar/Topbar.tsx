import RoleGuard from '@/components/RoleGuard/RoleGuard';
import { useRole } from '@/context/AuthContext';
import { Container, Title, Actions, Button, Search, ActionButton } from './styles';

interface TopbarProps {
  title: string;
  page: string;
  isSearchable?: boolean;
  onNew?: () => void;
}

export default function Topbar({ title, page, isSearchable = true, onNew }: TopbarProps) {
  const { canCreate } = useRole();
  
  return (
    <Container>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Title>{title}</Title>
        {isSearchable && (
          <Actions>
            <RoleGuard roles={['ADMIN']}>
              <ActionButton onClick={onNew}>Novo {page} +</ActionButton>
            </RoleGuard>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button>Ordenar</Button>
              <Button>Filtrar</Button>
            </div>
          </Actions>
        )}
        <Search placeholder="Buscar..." />
      </div>
    </Container>
  );
}
