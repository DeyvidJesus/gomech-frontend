import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "../../auth/components/ProtectedRoute";
import RoleGuard from "../../auth/components/RoleGuard";
import { useAuth } from "../../auth/hooks/useAuth";
import { auditApi } from "../services/api";
import type { AuditEventFilters, AuditEventResponse, AuditModule } from "../types/audit";

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

const metadataExample = `{
  "approvedBy": "admin@go-mech.com",
  "context": "Checklist concluído"
}`;

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
  const { data: auth } = useAuth();
  const [metadataText, setMetadataText] = useState(metadataExample);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<AuditEventResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"occurredAt" | "module" | "eventType" | "username">("occurredAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [formState, setFormState] = useState({
    eventType: auditEventTypes[0] ?? "OS_APPROVAL",
    operation: auditOperations[0] ?? "CREATE",
    module: auditModules[0]?.value ?? "INVENTORY",
    username: auth?.email ?? auth?.name ?? "",
    role: auth?.role ?? "ADMIN",
    occurredAt: formatDateTimeLocalInput(new Date()),
    referenceId: "",
  });

  const [filters, setFilters] = useState<AuditEventFilters>({
    page: 0,
    size: 10,
    sort: "occurredAt,DESC",
    module: undefined,
    eventType: undefined,
  });

  const eventsQuery = useQuery({
    queryKey: ["audit", "events", filters],
    queryFn: () => auditApi.listEvents(filters),
  });

  const events = eventsQuery.data?.content ?? [];

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return events;
    }

    return events.filter(event =>
      [
        event.eventType,
        event.operation,
        event.module,
        event.username,
        event.referenceId,
        event.blockchainHash,
        event.previousHash,
      ]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(term)),
    );
  }, [events, searchTerm]);

  const sortedEvents = useMemo(() => {
    const directionMultiplier = sortDirection === "asc" ? 1 : -1;
    return [...filteredEvents].sort((a, b) => {
      if (sortField === "occurredAt") {
        return (
          (new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()) * directionMultiplier * -1
        );
      }

      const aValue = (a[sortField] ?? "").toString().toLowerCase();
      const bValue = (b[sortField] ?? "").toString().toLowerCase();
      if (aValue === bValue) {
        return 0;
      }
      return aValue > bValue ? directionMultiplier : -directionMultiplier;
    });
  }, [filteredEvents, sortField, sortDirection]);

  const mutation = useMutation({
    mutationFn: auditApi.createEvent,
    onSuccess: data => {
      setLastEvent(data);
      void eventsQuery.refetch();
    },
  });

  const totalPages = eventsQuery.data?.totalPages ?? 0;
  const currentPage = eventsQuery.data?.number ?? 0;

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
        role: formState.role,
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
      <header className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-orangeWheel-500">Auditoria &amp; Trilhas de Acesso</h1>
        <p className="mt-2 text-sm text-gray-500">
          Registre manualmente operações críticas e acompanhe os eventos consolidados com assinatura blockchain.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {formError && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo de evento</label>
            <input
              list="audit-event-types"
              value={formState.eventType}
              onChange={event => setFormState(prev => ({ ...prev, eventType: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder="Ex: OS_APPROVAL"
              required
            />
            <datalist id="audit-event-types">
              {auditEventTypes.map(option => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Operação</label>
            <select
              value={formState.operation}
              onChange={event => setFormState(prev => ({ ...prev, operation: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            >
              {auditOperations.map(operation => (
                <option key={operation} value={operation}>
                  {operation}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Módulo</label>
            <select
              value={formState.module}
              onChange={event => setFormState(prev => ({ ...prev, module: event.target.value as AuditModule }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            >
              {auditModules.map(module => (
                <option key={module.value} value={module.value}>
                  {module.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Usuário responsável</label>
            <input
              value={formState.username}
              onChange={event => setFormState(prev => ({ ...prev, username: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder="usuario@go-mech.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Perfil</label>
            <select
              value={formState.role}
              onChange={event => setFormState(prev => ({ ...prev, role: event.target.value as typeof formState.role }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Referência (opcional)</label>
            <input
              value={formState.referenceId}
              onChange={event => setFormState(prev => ({ ...prev, referenceId: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder="Código da OS, cliente, etc."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Data e hora da ocorrência</label>
            <input
              type="datetime-local"
              value={formState.occurredAt}
              onChange={event => setFormState(prev => ({ ...prev, occurredAt: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              required
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
            placeholder={metadataExample}
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

      {lastEvent && <AuditEventPreview event={lastEvent} />}

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col text-sm">
              <label className="text-xs font-semibold text-gray-600">Filtrar por módulo</label>
              <select
                value={filters.module ?? ""}
                onChange={event =>
                  setFilters(prev => ({ ...prev, module: event.target.value || undefined, page: 0 }))
                }
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              >
                <option value="">Todos</option>
                {auditModules.map(module => (
                  <option key={module.value} value={module.value}>
                    {module.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col text-sm">
              <label className="text-xs font-semibold text-gray-600">Filtrar por tipo</label>
              <input
                list="audit-event-types"
                value={filters.eventType ?? ""}
                onChange={event =>
                  setFilters(prev => ({ ...prev, eventType: event.target.value || undefined, page: 0 }))
                }
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                placeholder="Qualquer tipo"
              />
            </div>
            <div className="flex flex-col text-sm">
              <label className="text-xs font-semibold text-gray-600">Busca</label>
              <input
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="mt-1 w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                placeholder="Usuário, hash, referência..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-xs font-semibold text-gray-600">Ordenar por</label>
            <select
              value={sortField}
              onChange={event => setSortField(event.target.value as typeof sortField)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            >
              <option value="occurredAt">Ocorrência</option>
              <option value="eventType">Tipo</option>
              <option value="module">Módulo</option>
              <option value="username">Usuário</option>
            </select>
            <button
              type="button"
              onClick={() => setSortDirection(prev => (prev === "asc" ? "desc" : "asc"))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              {sortDirection === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {eventsQuery.isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orangeWheel-500 border-t-transparent" />
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              Nenhum evento encontrado para os filtros informados.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Ocorrência</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Módulo</th>
                  <th className="px-3 py-2">Operação</th>
                  <th className="px-3 py-2">Usuário</th>
                  <th className="px-3 py-2">Hash</th>
                  <th className="px-3 py-2">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {sortedEvents.map(event => (
                  <tr key={event.id} className="align-top">
                    <td className="px-3 py-3 text-xs text-gray-500">
                      <div className="font-semibold text-gray-800">
                        {new Date(event.occurredAt).toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Registrado em {new Date(event.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-gray-800">{event.eventType}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{event.module}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{event.operation}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      <div className="font-semibold text-gray-800">{event.username}</div>
                      <div className="text-[10px] uppercase text-gray-400">{event.role}</div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {(() => {
                        const hash = event.blockchainHash ?? "";
                        if (!hash) {
                          return <span className="text-gray-400">—</span>;
                        }

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator?.clipboard?.writeText) {
                                void navigator.clipboard.writeText(hash);
                              }
                            }}
                            className="break-all text-left font-mono text-[11px] text-orangeWheel-600 hover:underline"
                            title="Clique para copiar"
                          >
                            {hash}
                          </button>
                        );
                      })()}
                      {event.previousHash && (
                        <div className="mt-1 text-[10px] text-gray-400">Prev: {event.previousHash}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {event.referenceId && <div>Ref: {event.referenceId}</div>}
                      {event.metadata && (
                        <pre className="mt-1 max-h-24 overflow-auto rounded bg-gray-900 p-2 font-mono text-[10px] text-orange-100">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 pt-3 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span>Página {currentPage + 1}</span>
            <span className="text-gray-400">de {Math.max(totalPages, 1)}</span>
            <select
              value={filters.size ?? 10}
              onChange={event =>
                setFilters(prev => ({ ...prev, size: Number(event.target.value), page: 0 }))
              }
              className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            >
              {[10, 20, 50].map(size => (
                <option key={size} value={size}>
                  {size} por página
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max((prev.page ?? 0) - 1, 0) }))}
              disabled={currentPage <= 0}
              className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  page: Math.min((prev.page ?? 0) + 1, Math.max(totalPages - 1, 0)),
                }))
              }
              disabled={currentPage >= totalPages - 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AuditEventPreview({ event }: { event: AuditEventResponse }) {
  return (
    <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Evento registrado</h2>
          <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString("pt-BR")}</p>
        </div>
        {event.blockchainHash && (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600">Blockchain</span>
        )}
      </div>
      <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
        <p>
          Tipo: <span className="font-semibold">{event.eventType}</span>
        </p>
        <p>
          Operação: <span className="font-semibold">{event.operation}</span>
        </p>
        <p>
          Usuário: <span className="font-semibold">{event.username}</span> ({event.role})
        </p>
        {event.referenceId && <p>Referência: {event.referenceId}</p>}
        {event.blockchainHash && <p>Hash: {event.blockchainHash}</p>}
      </div>
      {event.metadata && (
        <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-orange-100">
          {JSON.stringify(event.metadata, null, 2)}
        </pre>
      )}
    </section>
  );
}
