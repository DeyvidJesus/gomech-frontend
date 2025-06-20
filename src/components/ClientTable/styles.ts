import styled from 'styled-components';

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1.5px solid #1d1d1d;
  max-height: 500px;
  overflow-y: auto;
`;

export const Th = styled.th`
  background: #FFB961;
  padding: 0.75rem;
  text-align: left;
  font-weight: 500;
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