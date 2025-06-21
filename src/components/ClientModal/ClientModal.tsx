import { useState } from 'react';
import Modal from '../Modal/Modal';
import { Form, Field, Label, Input, Actions, Button } from './styles';
import axios from 'axios';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function ClientModal({ isOpen, onClose, onCreated }: ClientModalProps) {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [observations, setObservations] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await axios.post('http://localhost:5080/api/clients', {
      name,
      document,
      email,
      phone,
      address,
      birthDate,
      observations
    }, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    onCreated?.();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Novo Cliente</h2>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label>Nome</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field>
          <Label>Documento</Label>
          <Input value={document} onChange={e => setDocument(e.target.value)} required />
        </Field>
        <Field>
          <Label>Email</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
        </Field>
        <Field>
          <Label>Telefone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} />
        </Field>
        <Field>
          <Label>Endere\u00e7o</Label>
          <Input value={address} onChange={e => setAddress(e.target.value)} />
        </Field>
        <Field>
          <Label>Data de Nascimento</Label>
          <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
        </Field>
        <Field>
          <Label>Observa\u00e7\u00f5es</Label>
          <Input value={observations} onChange={e => setObservations(e.target.value)} />
        </Field>
        <Actions>
          <Button type="submit">Salvar</Button>
          <Button type="button" onClick={onClose}>Cancelar</Button>
        </Actions>
      </Form>
    </Modal>
  );
}
