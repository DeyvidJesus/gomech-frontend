import { useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import Topbar from '@/components/Topbar/Topbar';
import VehicleTable from '@/components/VehicleTable/VehicleTable';
import VehicleModal from '@/components/VehicleModal/VehicleModal';
import { Container, Main } from '../../styles/globals';

export default function VeiculosPage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <Container>
      <Sidebar />
      <Main>
        <Topbar title="Veículos" page="veículo" onNew={() => setModalOpen(true)} />
        <VehicleTable />
        <VehicleModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </Main>
    </Container>
  );
}
