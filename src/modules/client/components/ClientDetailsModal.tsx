import type { Client } from "../types/client";

interface ClientDetailsModalProps {
  client: Client;
  onClose: () => void;
}

export function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 }}>
        <h3>Detalhes do Cliente</h3>
        <p><b>ID:</b> {client.id}</p>
        <p><b>Nome:</b> {client.name}</p>
        <p><b>Email:</b> {client.email}</p>
        <p><b>Telefone:</b> {client.phone || '-'}</p>
        <p><b>Endereço:</b> {client.address || '-'}</p>
        <p><b>Criado em:</b> {new Date(client.createdAt).toLocaleString()}</p>
        <p><b>Atualizado em:</b> {new Date(client.updatedAt).toLocaleString()}</p>
        {client.vehicles && client.vehicles.length > 0 && (
          <div>
            <b>Veículos:</b>
            <ul>
              {client.vehicles.map((v) => (
                <li key={v.id}>{v.plate} - {v.model}</li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={onClose} style={{ marginTop: 12 }}>Fechar</button>
      </div>
    </div>
  );
}
