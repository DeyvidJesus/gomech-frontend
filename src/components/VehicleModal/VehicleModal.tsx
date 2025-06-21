import { useState } from 'react';
import Modal from '../Modal/Modal';
import { Form, Field, Label, Input, Actions, Button } from './styles';
import axios from 'axios';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function VehicleModal({ isOpen, onClose, onCreated }: VehicleModalProps) {
  const [licensePlate, setLicensePlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [color, setColor] = useState('');
  const [kilometers, setKilometers] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [observations, setObservations] = useState('');
  const [clientId, setClientId] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await axios.post('http://localhost:5080/api/vehicles', {
      licensePlate,
      brand,
      model,
      manufactureDate,
      color,
      kilometers: Number(kilometers),
      vehicleId,
      observations,
      client: { id: Number(clientId) }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    onCreated?.();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Novo Veículo</h2>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label>Placa</Label>
          <Input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required />
        </Field>
        <Field>
          <Label>Marca</Label>
          <Input value={brand} onChange={e => setBrand(e.target.value)} required />
        </Field>
        <Field>
          <Label>Modelo</Label>
          <Input value={model} onChange={e => setModel(e.target.value)} required />
        </Field>
        <Field>
          <Label>Data de Fabrica\u00e7\u00e3o</Label>
          <Input type="date" value={manufactureDate} onChange={e => setManufactureDate(e.target.value)} />
        </Field>
        <Field>
          <Label>Cor</Label>
          <Input value={color} onChange={e => setColor(e.target.value)} />
        </Field>
        <Field>
          <Label>Quilometragem</Label>
          <Input value={kilometers} onChange={e => setKilometers(e.target.value)} />
        </Field>
        <Field>
          <Label>ID Ve\u00edculo</Label>
          <Input value={vehicleId} onChange={e => setVehicleId(e.target.value)} />
        </Field>
        <Field>
          <Label>Observa\u00e7\u00f5es</Label>
          <Input value={observations} onChange={e => setObservations(e.target.value)} />
        </Field>
        <Field>
          <Label>ID do Cliente</Label>
          <Input value={clientId} onChange={e => setClientId(e.target.value)} />
        </Field>
        <Actions>
          <Button type="submit">Salvar</Button>
          <Button type="button" onClick={onClose}>Cancelar</Button>
        </Actions>
      </Form>
    </Modal>
  );
}
