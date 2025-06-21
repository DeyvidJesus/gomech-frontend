import { useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import Topbar from '@/components/Topbar/Topbar';
import ServiceOrderTable from '@/components/ServiceOrderTable/ServiceOrderTable';
import ServiceOrderModal from '@/components/ServiceOrderModal/ServiceOrderModal';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Container, Main } from '../../styles/globals';

export default function OSPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <ProtectedRoute>
      <Container>
        <Sidebar />
        <Main>
          <Topbar title="Ordens de Serviço" page="os" onNew={() => setModalOpen(true)} />
          <ServiceOrderTable />
          <ServiceOrderModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        </Main>
      </Container>
    </ProtectedRoute>
  );
}
