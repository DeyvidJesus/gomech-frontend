import { useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import ClientTable from '../../components/ClientTable/ClientTable';
import Topbar from '../../components/Topbar/Topbar';
import ClientModal from '@/components/ClientModal/ClientModal';
import { Container, Main } from '../../styles/globals';

export default function ClientesPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <Container>
      <Sidebar />
      <Main>
        <Topbar title="Clientes" page="cliente" onNew={() => setModalOpen(true)} />
        <ClientTable />
        <ClientModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </Main>
    </Container>
  );
}
