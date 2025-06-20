import Image from 'next/image';
import { Aside, Nav, MenuItem, MenuItemLink } from './styles';

export default function Sidebar() {
  return (
    <Aside>
      <Image src="/logo.svg" alt="GoMech" width={80} height={80} />
      <Nav>
        <MenuItem><MenuItemLink href="/">Dashboard</MenuItemLink></MenuItem>
        <MenuItem><MenuItemLink href="/clientes">Clientes</MenuItemLink></MenuItem>
        <MenuItem><MenuItemLink href="/veiculos">Veículos</MenuItemLink></MenuItem>
        <MenuItem><MenuItemLink href="/os">Ordens de Serviço</MenuItemLink></MenuItem>
        <MenuItem><MenuItemLink href="/configuracoes">Configurações</MenuItemLink></MenuItem>
      </Nav>
    </Aside>
  );
}
