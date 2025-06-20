import { useEffect, useState } from "react";
import { Table, Th, Tr, Td, ActionButton } from "./styles";
import axios from "axios";

interface Client {
  name: string;
  document: string;
  email: string;
  phone: string;
  vehicle: string;
}

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    async function getClients() {
      try {
        const response = await axios.get('http://localhost:5080/api/clients', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        setClients(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    }

    getClients();
  }, [])

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
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <Tr key={index}>
              <Td>{client.name}</Td>
              <Td>{client.document}</Td>
              <Td>{client.email}</Td>
              <Td>{client.phone}</Td>
              <Td>{client.vehicle}</Td>
              <Td>
                <ActionButton title="Editar">✏️</ActionButton>
                <ActionButton title="Visualizar">🔗</ActionButton>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
