import { useState } from 'react';
import Modal from '../Modal/Modal';
import { Form, Field, Label, Input, Actions, Button } from './styles';

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, document, email, phone })
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
        <Actions>
          <Button type="submit">Salvar</Button>
          <Button type="button" onClick={onClose}>Cancelar</Button>
        </Actions>
      </Form>
    </Modal>
  );
}
