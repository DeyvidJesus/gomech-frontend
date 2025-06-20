import Image from 'next/image';
import { Aside, Logo, Nav, MenuItem } from './styles';

export default function Sidebar() {
  return (
    <Aside>
      <Logo>
        <Image src="/logo.png" alt="GoMech" width={150} height={150} />
      </Logo>
      <Nav>
        <MenuItem href="/">Dashboard</MenuItem>
        <MenuItem href="/clientes">Clientes</MenuItem>
        <MenuItem href="/veiculos">Veículos</MenuItem>
        <MenuItem href="/os">Ordens de Serviço</MenuItem>
        <MenuItem href="/configuracoes">Configurações</MenuItem>
      </Nav>
    </Aside>
  );
}
