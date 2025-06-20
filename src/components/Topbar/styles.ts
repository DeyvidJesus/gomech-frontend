import styled from 'styled-components';

export const Container = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
`;

export const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: #FFB961;
  color: #1d1d1d;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #1d1d1d;
`;

export const Button = styled.button`
  background: #FFF;
  padding: 0.5rem 1rem;
  color: #1d1d1d;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #1d1d1d;
`;

export const Search = styled.input`
  padding: 0.5rem;
  border: 1px solid #1d1d1d;
  width: 100%;
  border-radius: 4px;
  margin-top: 30px;
`;
