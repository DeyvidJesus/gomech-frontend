import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { auditApi } from "../../audit/services/api";
import type { AuditEventRequest, AuditEventResponse, AuditModule } from "../../audit/types/audit";

const auditModules: Array<{ value: AuditModule; label: string }> = [
  { value: "INVENTORY", label: "Estoque" },
  { value: "SERVICE_ORDER", label: "Ordem de serviço" },
  { value: "CUSTOMER", label: "Cliente" },
  { value: "OPERATIONS", label: "Operações" },
  { value: "SUPPLIER", label: "Fornecedor" },
  { value: "ANALYTICS", label: "Analytics" },
  { value: "AUDIT", label: "Auditoria" },
];

const auditEventTypes = [
  "OS_APPROVAL",
  "PART_RESERVATION",
  "STOCK_ADJUSTMENT",
  "USER_SESSION",
  "DASHBOARD_EXPORT",
];

const auditOperations = ["CREATE", "UPDATE", "DELETE", "APPROVE", "EXPORT"];

const defaultMetadataExample = '{\n  "approvedBy": "admin@go-mech.com"\n}';

function formatDateTimeLocalInput(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

function toISOString(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

export default function AuditPanel() {
  const [metadataText, setMetadataText] = useState(defaultMetadataExample);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<AuditEventResponse | null>(null);
  const [formState, setFormState] = useState({
    eventType: auditEventTypes[0] ?? "OS_APPROVAL",
    operation: auditOperations[0] ?? "CREATE",
    module: auditModules[0]?.value ?? "INVENTORY",
    username: "",
    role: "ADMIN",
    occurredAt: formatDateTimeLocalInput(new Date()),
    referenceId: "",
  });

  const mutation = useMutation<AuditEventResponse, unknown, AuditEventRequest>({
    mutationFn: auditApi.createEvent,
    onSuccess: data => {
      setLastEvent(data);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setLastEvent(null);

    if (!formState.eventType.trim() || !formState.operation.trim() || !formState.username.trim()) {
      setFormError("Preencha tipo, operação e usuário responsáveis pelo evento");
      return;
    }

    const occurredAtIso = toISOString(formState.occurredAt);
    if (!occurredAtIso) {
      setFormError("Informe uma data/hora válida");
      return;
    }

    try {
      const metadata = metadataText.trim() ? (JSON.parse(metadataText) as Record<string, unknown>) : undefined;
      mutation.mutate({
        eventType: formState.eventType.trim(),
        operation: formState.operation.trim(),
        module: formState.module,
        username: formState.username.trim(),
        role: formState.role.trim(),
        occurredAt: occurredAtIso,
        referenceId: formState.referenceId.trim() || undefined,
        metadata,
      });
    } catch (parseError) {
      setFormError("Metadados inválidos. Informe um JSON válido.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-orangeWheel-500">Registro de Auditoria</h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          Documente ações críticas com registro imutável em blockchain.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        {formError && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col text-sm">
            <label className="text-xs font-semibold text-gray-600">Tipo do evento</label>
            <select
              value={formState.eventType}
              onChange={event => setFormState(prev => ({ ...prev, eventType: event.target.value }))}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            >
              {auditEventTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-xs font-semibold text-gray-600">Operação</label>
            <select
              value={formState.operation}
              onChange={event => setFormState(prev => ({ ...prev, operation: event.target.value }))}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            >
              {auditOperations.map(operation => (
                <option key={operation} value={operation}>
                  {operation}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-xs font-semibold text-gray-600">Módulo</label>
            <select
              value={formState.module}
              onChange={event => setFormState(prev => ({ ...prev, module: event.target.value as AuditModule }))}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            >
              {auditModules.map(module => (
                <option key={module.value} value={module.value}>
                  {module.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-xs font-semibold text-gray-600">Referência</label>
            <input
              value={formState.referenceId}
              onChange={event => setFormState(prev => ({ ...prev, referenceId: event.target.value }))}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder="ID da OS, cliente, etc."
            />
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-xs font-semibold text-gray-600">Usuário responsável</label>
            <input
              value={formState.username}
              onChange={event => setFormState(prev => ({ ...prev, username: event.target.value }))}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder="usuario@go-mech.com"
              required
            />
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-xs font-semibold text-gray-600">Papel</label>
            <input
              value={formState.role}
              onChange={event => setFormState(prev => ({ ...prev, role: event.target.value }))}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder="ADMIN"
            />
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-xs font-semibold text-gray-600">Data/hora da ocorrência</label>
            <input
              type="datetime-local"
              value={formState.occurredAt}
              onChange={event => setFormState(prev => ({ ...prev, occurredAt: event.target.value }))}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              required
            />
          </div>
        </div>
        <div className="flex flex-col text-sm">
          <label className="text-xs font-semibold text-gray-600">Metadados adicionais (JSON)</label>
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

      {mutation.isError && !formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(mutation.error as any)?.response?.data?.message ?? "Não foi possível registrar o evento."}
        </div>
      )}

      {lastEvent && (
        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Evento registrado</h3>
              <p className="text-xs text-gray-500">{new Date(lastEvent.createdAt).toLocaleString("pt-BR")}</p>
            </div>
            {lastEvent.blockchainHash && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600">Blockchain</span>
            )}
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
            <p>
              Tipo: <span className="font-semibold">{lastEvent.eventType}</span>
            </p>
            <p>
              Operação: <span className="font-semibold">{lastEvent.operation}</span>
            </p>
            <p>
              Módulo: <span className="font-semibold">{lastEvent.module}</span>
            </p>
            <p>
              Usuário: <span className="font-semibold">{lastEvent.username}</span>
            </p>
            <p>
              Papel: <span className="font-semibold">{lastEvent.role}</span>
            </p>
            <p>
              Ocorrência: {new Date(lastEvent.occurredAt).toLocaleString("pt-BR")}
            </p>
            {lastEvent.referenceId && <p>Referência: {lastEvent.referenceId}</p>}
            {lastEvent.blockchainHash && <p>Hash: {lastEvent.blockchainHash}</p>}
          </div>
          {lastEvent.metadata && (
            <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-xs sm:text-sm text-orange-100">
              {JSON.stringify(lastEvent.metadata, null, 2)}
            </pre>
          )}
        </section>
      )}
    </div>
  );
}
