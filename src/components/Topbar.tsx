import styled from 'styled-components';

const Container = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #ea580c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Search = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export default function Topbar() {
  return (
    <Container>
      <Title>Clientes</Title>
      <Actions>
        <Button>Novo cliente +</Button>
        <Button>Ordenar</Button>
        <Button>Filtrar</Button>
        <Search placeholder="Buscar..." />
      </Actions>
    </Container>
  );
}
