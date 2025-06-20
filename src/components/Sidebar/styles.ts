import Link from 'next/link';
import styled from 'styled-components';

export const Aside = styled.aside`
  width: 220px;
  background: #ea580c;
  color: #fff;
  padding: 1rem;
  margin: 14px;
  border-radius: 10px;
`;

export const Logo = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  img {
    max-width: 150px;
  }
`;

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MenuItem = styled(Link)`
  color: #fff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;