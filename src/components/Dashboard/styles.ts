import styled from 'styled-components';

export const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: calc(100vh - 80px);
`;

export const WelcomeMessage = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    color: #ea580c;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6b7280;
    font-size: 1.1rem;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

export const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

export const Title = styled.h3`
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
`;

export const Value = styled.div`
  color: #ea580c;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
`; 