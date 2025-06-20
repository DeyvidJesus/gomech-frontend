import { Container, Title, Actions, Button, Search, ActionButton } from './styles';

interface TopbarProps {
  title: string;
  page: string;
  isSearchable?: boolean;
}

export default function Topbar({ title, page, isSearchable = true }: TopbarProps) {
  return (
    <Container>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Title>{title}</Title>
        {isSearchable && (
          <Actions>
            <ActionButton>Novo {page} +</ActionButton>
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
