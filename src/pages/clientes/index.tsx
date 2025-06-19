import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import ClientTable from '../../components/ClientTable';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
`;

export default function ClientesPage() {
  return (
    <Container>
      <Sidebar />
      <Main>
        <Topbar />
        <ClientTable />
      </Main>
    </Container>
  );
}
