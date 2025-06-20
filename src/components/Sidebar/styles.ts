import styled from 'styled-components';
import Link from 'next/link';
export const Aside = styled.aside`
  width: 220px;
  background: #F3810D;
  color: #fff;
  margin: 14px;
  border-radius: 10px;
`;

export const Nav = styled.nav`
  display: flex;
  gap: 0;
  flex-direction: column;
`;

export const MenuItem = styled.div`
  color: #fff;
  padding: 10px;
  background: #424242;
`;

export const MenuItemLink = styled(Link)`
  text-decoration: none;
  color: #fff;
`;

