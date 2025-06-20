import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const Content = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;
