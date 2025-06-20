import { Container, Title, Actions, Button, Search } from './styles';

interface TopbarProps {
  title: string;
  page: string;
  isSearchable?: boolean;
  onNew?: () => void;
}

export default function Topbar({ title, page, isSearchable = true, onNew }: TopbarProps) {
  return (
    <Container>
      <Title>{title}</Title>
      {isSearchable && (
        <Actions>
          <Button onClick={onNew}>Novo {page} +</Button>
          <Button>Ordenar</Button>
          <Button>Filtrar</Button>
          <Search placeholder="Buscar..." />
        </Actions>
      )}
    </Container>
  );
}
