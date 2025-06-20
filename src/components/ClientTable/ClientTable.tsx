import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetch('http://localhost:3000/api/clients')
      .then(res => res.json())
      .then(setClients);
  }, []);
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
          {clients.map((client) => (
            <Tr key={client.id}>
              <Td>{client.name}</Td>
              <Td>{client.document}</Td>
              <Td>{client.email}</Td>
              <Td>{client.phone}</Td>
              <Td>{client.vehicles.map(v => v.licensePlate).join(', ')}</Td>
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
