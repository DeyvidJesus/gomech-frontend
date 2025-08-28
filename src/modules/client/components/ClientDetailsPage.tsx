import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { clientsApi } from "../services/api";
import type { Client } from "../types/client";

export function ClientDetailsPage() {
  const { id } = useParams({ from: "/clients/$id" });
  const navigate = useNavigate();
  const clientId = Number(id);

  const { data: client, isLoading, error } = useQuery<Client>({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const res = await clientsApi.getById(clientId);
      return res.data;
    },
    enabled: !!clientId,
  });

  if (isLoading) return <div>Carregando cliente...</div>;
  if (error || !client) return <div>Cliente não encontrado.</div>;

  return (
    <div>
      <button onClick={() => navigate({ to: "/clients" })}>Voltar</button>
      <h2>Detalhes do Cliente</h2>
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
    </div>
  );
}
