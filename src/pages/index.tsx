import Sidebar from '@/components/Sidebar/Sidebar';
import Topbar from '@/components/Topbar/Topbar';
import Dashboard from '@/components/Dashboard/Dashboard';
import { Main } from './globals';
import { Container } from './globals';

export default function Home() {
  return (
    <Container>
      <Sidebar />
      <Main>
        <Topbar title="Home" page="home" isSearchable={false} />
        <Dashboard />
      </Main>
    </Container>
  );
}
