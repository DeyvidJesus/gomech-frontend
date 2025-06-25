import { useState } from 'react';
import Modal from '../Modal/Modal';
import { Form, Field, Label, Input, Actions, Button } from './styles';
import axios from 'axios';

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function ServiceOrderModal({ isOpen, onClose, onCreated }: ServiceOrderModalProps) {
  const [description, setDescription] = useState('');
  const [vehicleId, setVehicleId] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await axios.post('https://clear-ellene-deyvidgondim-8b8a208e.koyeb.app/api/orders', {
      description,
      vehicleId
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
      <h2>Nova Ordem de Serviço</h2>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label>Descrição</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} required />
        </Field>
        <Field>
          <Label>ID do Veículo</Label>
          <Input value={vehicleId} onChange={e => setVehicleId(e.target.value)} required />
        </Field>
        <Actions>
          <Button type="submit">Salvar</Button>
          <Button type="button" onClick={onClose}>Cancelar</Button>
        </Actions>
      </Form>
    </Modal>
  );
}
