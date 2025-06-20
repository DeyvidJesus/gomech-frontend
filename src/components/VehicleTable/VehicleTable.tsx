import { Table, Th, Tr, Td } from './styles';

interface Vehicle {
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
}

const vehicles: Vehicle[] = [
  { licensePlate: 'BRA2E19', brand: 'Honda', model: 'Civic SI', color: 'Prata' },
];

export default function VehicleTable() {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Placa</Th>
          <Th>Marca</Th>
          <Th>Modelo</Th>
          <Th>Cor</Th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map((v, i) => (
          <Tr key={i}>
            <Td>{v.licensePlate}</Td>
            <Td>{v.brand}</Td>
            <Td>{v.model}</Td>
            <Td>{v.color}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
