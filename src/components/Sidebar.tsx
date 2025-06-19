import Link from 'next/link';
import styled from 'styled-components';

const Aside = styled.aside`
  width: 220px;
  background: #ea580c;
  color: #fff;
  min-height: 100vh;
  padding: 1rem;
`;

const Logo = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  img {
    max-width: 150px;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MenuItem = styled(Link)`
  color: #fff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

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
