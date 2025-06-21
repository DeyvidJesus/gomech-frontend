import { useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import VehicleTable from '../../components/VehicleTable/VehicleTable';
import Topbar from '../../components/Topbar/Topbar';
import VehicleModal from '@/components/VehicleModal/VehicleModal';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Container, Main } from '../../styles/globals';

export default function VeiculosPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <ProtectedRoute>
      <Container>
        <Sidebar />
        <Main>
          <Topbar title="Veículos" page="veiculo" onNew={() => setModalOpen(true)} />
          <VehicleTable />
          <VehicleModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        </Main>
      </Container>
    </ProtectedRoute>
  );
}
