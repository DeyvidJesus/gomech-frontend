import Sidebar from '@/components/Sidebar/Sidebar';
import ClientTable from '../../components/ClientTable/ClientTable';
import Topbar from '../../components/Topbar/Topbar';
import { Container, Main } from '../globals';

export default function ClientesPage() {
  return (
    <Container>
      <Sidebar />
      <Main>
        <Topbar title="Clientes" page="cliente" />
        <ClientTable />
      </Main>
    </Container>
  );
}
