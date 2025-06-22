import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard/RoleGuard";
import { apiService } from "@/services/api";
import { Table, Th, Tr, Td, ActionButton } from "./styles";

interface Vehicle {
  licensePlate: string;
}

interface Client {
  id: number;
  name: string;
  document: string;
  email: string;
  phone: string;
  vehicles: Vehicle[];
}

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getClients() {
      try {
        setLoading(true);
        const response = await apiService.clients.getAll();
        setClients(response.data);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    }

    getClients();
  }, []);

  const handleEdit = (clientId: number) => {
    console.log('Editar cliente:', clientId);
    // Implementar lógica de edição
  };

  const handleView = (clientId: number) => {
    console.log('Visualizar cliente:', clientId);
    // Implementar lógica de visualização
  };

  const handleDelete = async (clientId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await apiService.clients.delete(clientId);
        setClients(clients.filter(client => client.id !== clientId));
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Carregando clientes...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxHeight: '480px', overflowY: 'auto' }}>
      <Table>
        <thead style={{ position: 'sticky', top: 0, background: '#FFB961' }}>
          <tr>
            <Th>Nome</Th>
            <Th>Documento</Th>
            <Th>E-mail</Th>
            <Th>Telefone</Th>
            <Th>Veículos</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <Tr key={client.id}>
              <Td>{client.name}</Td>
              <Td>{client.document}</Td>
              <Td>{client.email}</Td>
              <Td>{client.phone}</Td>
              <Td>{client.vehicles.map(v => v.licensePlate).join(', ')}</Td>
              <Td>
                {/* Botão visualizar - disponível para todos */}
                <ActionButton 
                  title="Visualizar" 
                  onClick={() => handleView(client.id)}
                >
                  👁️
                </ActionButton>
                
                {/* Botões de edição e exclusão apenas para ADMIN */}
                <RoleGuard roles={['ADMIN']}>
                  <ActionButton 
                    title="Editar"
                    onClick={() => handleEdit(client.id)}
                  >
                    ✏️
                  </ActionButton>
                  <ActionButton 
                    title="Excluir"
                    onClick={() => handleDelete(client.id)}
                    style={{ color: '#e74c3c' }}
                  >
                    🗑️
                  </ActionButton>
                </RoleGuard>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      
      {clients.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Nenhum cliente encontrado
        </div>
      )}
    </div>
  );
}
