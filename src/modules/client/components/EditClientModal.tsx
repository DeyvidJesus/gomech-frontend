import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../services/api";
import type { Client } from "../types/client";

interface EditClientModalProps {
  client: Client;
  onClose: () => void;
}

export function EditClientModal({ client, onClose }: EditClientModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<Client>>({ ...client });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Partial<Client>) => clientsApi.update(client.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onClose();
    },
    onError: () => setError("Erro ao atualizar cliente."),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    mutation.mutate(form, {
      onSettled: () => setLoading(false),
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 }}>
        <h3>Editar Cliente</h3>
        <label>Nome:<br />
          <input name="name" value={form.name || ''} onChange={handleChange} required />
        </label><br />
        <label>Email:<br />
          <input name="email" value={form.email || ''} onChange={handleChange} required />
        </label><br />
        <label>Telefone:<br />
          <input name="phone" value={form.phone || ''} onChange={handleChange} />
        </label><br />
        <label>Endereço:<br />
          <input name="address" value={form.address || ''} onChange={handleChange} />
        </label><br />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancelar</button>
      </form>
    </div>
  );
}
