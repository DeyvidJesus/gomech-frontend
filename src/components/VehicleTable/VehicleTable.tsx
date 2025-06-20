import { useEffect, useState } from 'react';
import { Table, Th, Tr, Td } from './styles';

interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
}

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/vehicles')
      .then(res => res.json())
      .then(setVehicles);
  }, []);
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
