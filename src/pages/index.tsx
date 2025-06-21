import Sidebar from '@/components/Sidebar/Sidebar';
import Topbar from '@/components/Topbar/Topbar';
import Dashboard from '@/components/Dashboard/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Main } from '../styles/globals';
import { Container } from '../styles/globals';

export default function Home() {
  return (
    <ProtectedRoute>
      <Container>
        <Sidebar />
        <Main>
          <Topbar title="Home" page="home" isSearchable={false} />
          <Dashboard />
        </Main>
      </Container>
    </ProtectedRoute>
  );
}
