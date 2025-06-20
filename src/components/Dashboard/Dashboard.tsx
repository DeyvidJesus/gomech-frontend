import { DashboardContainer, WelcomeMessage, StatsGrid, StatCard, Title, Value } from './styles';

export default function Dashboard() {
  return (
    <DashboardContainer>
      <WelcomeMessage>
        <h1>Bem-vindo ao GoMech!</h1>
        <p>Aqui você pode gerenciar seus clientes, veículos e ordens de serviço.</p>
      </WelcomeMessage>
      
      <StatsGrid>
        <StatCard>
          <Title>Total de Clientes</Title>
          <Value>0</Value>
        </StatCard>
        
        <StatCard>
          <Title>Veículos Cadastrados</Title>
          <Value>0</Value>
        </StatCard>
        
        <StatCard>
          <Title>Ordens de Serviço</Title>
          <Value>0</Value>
        </StatCard>
        
        <StatCard>
          <Title>Serviços Concluídos</Title>
          <Value>0</Value>
        </StatCard>
      </StatsGrid>
    </DashboardContainer>
  );
} 