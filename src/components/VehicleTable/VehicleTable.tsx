import { useEffect, useState } from 'react';
import { Table, Th, Tr, Td } from './styles';
import axios from 'axios';

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
    async function getVehicles() {
      const response = await axios.get('http://localhost:5080/api/vehicles', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setVehicles(response.data);
    }

    getVehicles();
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
