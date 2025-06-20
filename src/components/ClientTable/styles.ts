import styled from 'styled-components';

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  background: #fdba74;
  padding: 0.75rem;
  text-align: left;
`;

export const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
`;

export const Tr = styled.tr`
  &:nth-child(even) {
    background: #f9fafb;
  }
`;

export const ActionButton = styled.button`
  margin-right: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
`;