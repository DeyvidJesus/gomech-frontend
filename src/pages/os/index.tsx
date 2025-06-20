import { useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import Topbar from '@/components/Topbar/Topbar';
import ServiceOrderTable from '@/components/ServiceOrderTable/ServiceOrderTable';
import ServiceOrderModal from '@/components/ServiceOrderModal/ServiceOrderModal';
import { Container, Main } from '../globals';

export default function OrdersPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <Container>
      <Sidebar />
      <Main>
        <Topbar title="Ordens de Serviço" page="ordem" onNew={() => setModalOpen(true)} />
        <ServiceOrderTable />
        <ServiceOrderModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </Main>
    </Container>
  );
}
