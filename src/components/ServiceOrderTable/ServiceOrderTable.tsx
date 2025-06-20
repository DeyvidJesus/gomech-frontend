import { Table, Th, Tr, Td } from './styles';

interface ServiceOrder {
  id: number;
  description: string;
  vehicleId: string;
}

const orders: ServiceOrder[] = [
  { id: 1, description: 'Troca de óleo', vehicleId: '1' }
];

export default function ServiceOrderTable() {
  return (
    <Table>
      <thead>
        <tr>
          <Th>ID</Th>
          <Th>Descrição</Th>
          <Th>ID Veículo</Th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <Tr key={o.id}>
            <Td>{o.id}</Td>
            <Td>{o.description}</Td>
            <Td>{o.vehicleId}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
