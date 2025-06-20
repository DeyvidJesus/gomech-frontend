import { Container, Title, Actions, Button, Search } from './styles';

export default function Topbar({ title, page }: { title: string; page: string }) {
  return (
    <Container>
      <Title>{title}</Title>
      <Actions>
        <Button>Novo {page} +</Button>
        <Button>Ordenar</Button>
        <Button>Filtrar</Button>
        <Search placeholder="Buscar..." />
      </Actions>
    </Container>
  );
}
