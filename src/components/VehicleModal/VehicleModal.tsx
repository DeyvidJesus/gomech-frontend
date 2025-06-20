import { useState } from 'react';
import Modal from '../Modal/Modal';
import { Form, Field, Label, Input, Actions, Button } from './styles';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function VehicleModal({ isOpen, onClose, onCreated }: VehicleModalProps) {
  const [licensePlate, setLicensePlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('http://localhost:3000/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licensePlate, brand, model, color })
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
          <Label>Cor</Label>
          <Input value={color} onChange={e => setColor(e.target.value)} />
        </Field>
        <Actions>
          <Button type="submit">Salvar</Button>
          <Button type="button" onClick={onClose}>Cancelar</Button>
        </Actions>
      </Form>
    </Modal>
  );
}
