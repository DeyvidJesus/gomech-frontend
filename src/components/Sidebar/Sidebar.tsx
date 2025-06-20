import { Aside, Logo, Nav, MenuItem } from './styles';

export default function Sidebar() {
  return (
    <Aside>
      <Logo>
        <img src="/logo.png" alt="GoMech" />
      </Logo>
      <Nav>
        <MenuItem href="/clientes">Clientes</MenuItem>
        <MenuItem href="#">Veículos</MenuItem>
        <MenuItem href="#">Ordens de Serviço</MenuItem>
        <MenuItem href="#">Configurações</MenuItem>
      </Nav>
    </Aside>
  );
}
