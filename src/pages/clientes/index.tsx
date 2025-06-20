import ClientTable from '../../components/ClientTable/ClientTable';
import Topbar from '../../components/Topbar/Topbar';
import { Container } from '../globals';

export default function ClientesPage() {
  return (
    <Container>
      <Topbar title="Clientes" page="cliente" />
      <ClientTable />
    </Container>
  );
}
