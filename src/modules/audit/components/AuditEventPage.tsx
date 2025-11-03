import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import ProtectedRoute from "../../auth/components/ProtectedRoute";
import RoleGuard from "../../auth/components/RoleGuard";
import { auditApi } from "../services/api";
import type { AuditEventResponse } from "../types/audit";

export default function AuditEventPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <RoleGuard roles={["ADMIN"]}>
        <AuditEventContent />
      </RoleGuard>
    </ProtectedRoute>
  );
}

function AuditEventContent() {
  const defaultMetadataExample = '{\n  "approvedBy": "admin@go-mech.com"\n}';
  const [action, setAction] = useState("OS_APPROVAL");
  const [referenceId, setReferenceId] = useState("");
  const [metadataText, setMetadataText] = useState(defaultMetadataExample);
  const [error, setError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<AuditEventResponse | null>(null);

  const mutation = useMutation({
    mutationFn: auditApi.createEvent,
    onSuccess: response => {
      setLastEvent(response.data);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLastEvent(null);

    if (!action.trim()) {
      setError("Descreva a ação auditável");
      return;
    }

    try {
      const metadata = metadataText.trim() ? JSON.parse(metadataText) : undefined;
      mutation.mutate({ action: action.trim(), referenceId: referenceId.trim() || undefined, metadata });
    } catch (parseError) {
      setError("Metadados inválidos. Informe um JSON válido.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-orangeWheel-500">Registro de Auditoria</h1>
        <p className="mt-2 text-sm text-gray-500">Documente ações críticas com registro imutável em blockchain.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Ação</label>
            <input
              value={action}
              onChange={event => setAction(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder="ex: OS_APPROVAL"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Referência</label>
            <input
              value={referenceId}
              onChange={event => setReferenceId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder="ID da OS, cliente, etc."
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Metadados adicionais (JSON)</label>
          <textarea
            rows={6}
            value={metadataText}
            onChange={event => setMetadataText(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            placeholder={defaultMetadataExample}
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {mutation.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Registrando...
            </>
          ) : (
            <>Registrar evento</>
          )}
        </button>
      </form>

      {mutation.isError && !error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(mutation.error as any)?.response?.data?.message ?? "Não foi possível registrar o evento."}
        </div>
      )}

      {lastEvent && (
        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Evento registrado</h2>
              <p className="text-xs text-gray-500">{new Date(lastEvent.createdAt).toLocaleString("pt-BR")}</p>
            </div>
            {lastEvent.blockchainHash && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600">Blockchain</span>
            )}
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
            <p>Ação: <span className="font-semibold">{lastEvent.action}</span></p>
            {lastEvent.referenceId && <p>Referência: {lastEvent.referenceId}</p>}
            {lastEvent.blockchainHash && <p>Hash: {lastEvent.blockchainHash}</p>}
          </div>
          {lastEvent.metadata && (
            <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-orange-100">
              {JSON.stringify(lastEvent.metadata, null, 2)}
            </pre>
          )}
        </section>
      )}
    </div>
  );
}
