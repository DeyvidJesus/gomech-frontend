import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import RoleGuard from "../../auth/components/RoleGuard";
import ProtectedRoute from "../../auth/components/ProtectedRoute";
import { inventoryApi } from "../services/api";
import type {
  InventoryAvailability,
  InventoryHistoryEntry,
  InventoryItem,
  InventoryItemCreateDTO,
  InventoryItemUpdateDTO,
  InventoryMovement,
  InventoryRecommendation,
  RecommendationPipeline,
} from "../types/inventory";
import { InventoryItemModal } from "./InventoryItemModal";

const tabs = [
  { id: "items", label: "Itens" },
  { id: "movements", label: "Movimentações" },
  { id: "recommendations", label: "Recomendações" },
  { id: "availability", label: "Disponibilidade" },
  { id: "history", label: "Histórico" },
] as const;

type InventoryTab = (typeof tabs)[number]["id"];

interface AvailabilityState {
  part?: InventoryAvailability | null;
  vehicle?: InventoryAvailability | null;
  client?: InventoryAvailability | null;
}

interface HistoryState {
  vehicle?: InventoryHistoryEntry[] | null;
  client?: InventoryHistoryEntry[] | null;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SectionCard({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${highlight ? "border-orangeWheel-300 bg-orangeWheel-50" : "border-gray-200 bg-white"}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-orangeWheel-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

export default function InventoryDashboard() {
  return (
    <ProtectedRoute>
      <InventoryDashboardContent />
    </ProtectedRoute>
  );
}

function InventoryDashboardContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<InventoryTab>("items");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [movementFilters, setMovementFilters] = useState<{ partId?: number; serviceOrderId?: number; vehicleId?: number }>({});
  const [recommendationFilters, setRecommendationFilters] = useState<{ vehicleId?: number; serviceOrderId?: number; limit?: number; pipelineId?: string }>({ limit: 5 });
  const [availabilityIds, setAvailabilityIds] = useState<{ partId?: number; vehicleId?: number; clientId?: number }>({});
  const [availabilityData, setAvailabilityData] = useState<AvailabilityState>({});
  const [historyIds, setHistoryIds] = useState<{ vehicleId?: number; clientId?: number }>({});
  const [historyData, setHistoryData] = useState<HistoryState>({});

  const { data: items = [], isLoading: isLoadingItems, error: itemsError } = useQuery<InventoryItem[]>({
    queryKey: ["inventory", "items"],
    queryFn: inventoryApi.getItems,
  });

  const createItemMutation = useMutation({
    mutationFn: (payload: InventoryItemCreateDTO) => inventoryApi.createItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryItemUpdateDTO }) => inventoryApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => inventoryApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
    },
  });

  const entryMutation = useMutation({ mutationFn: inventoryApi.registerEntry });
  const reserveMutation = useMutation({ mutationFn: inventoryApi.reserveStock });
  const consumeMutation = useMutation({ mutationFn: inventoryApi.consumeStock });
  const cancelReservationMutation = useMutation({ mutationFn: inventoryApi.cancelReservation });
  const returnMutation = useMutation({ mutationFn: inventoryApi.registerReturn });

  const { data: movements = [], refetch: refetchMovements, isFetching: isFetchingMovements } = useQuery<InventoryMovement[]>({
    queryKey: ["inventory", "movements", movementFilters],
    queryFn: () => inventoryApi.listMovements(movementFilters),
  });

  const { data: pipelines = [] } = useQuery<RecommendationPipeline[]>({
    queryKey: ["inventory", "pipelines"],
    queryFn: async () => {
      const response = await inventoryApi.getRecommendationPipelines();
      return response.data;
    },
  });

  const { data: recommendations = [], refetch: refetchRecommendations, isFetching: isFetchingRecommendations } =
    useQuery<InventoryRecommendation[]>({
      queryKey: ["inventory", "recommendations", recommendationFilters],
      queryFn: async () => {
        const response = await inventoryApi.getRecommendations(recommendationFilters);
        return response.data;
      },
    });

  const { data: criticalParts = [] } = useQuery<InventoryRecommendation[]>({
    queryKey: ["inventory", "criticalParts"],
    queryFn: async () => {
      const response = await inventoryApi.getCriticalPartsReport();
      return response.data;
    },
  });

  const filteredItems = useMemo(() => {
    if (!search.trim()) {
      return items;
    }

    const term = search.toLowerCase();
    return items.filter(item =>
      [item.partName, item.location, item.status]
        .filter(Boolean)
        .some(value => value?.toLowerCase().includes(term)),
    );
  }, [items, search]);

  const totalStockValue = items.reduce(
    (sum, item) => sum + (item.averageCost ?? 0) * item.availableQuantity,
    0,
  );
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.availableQuantity <= item.minimumQuantity).length;

  const handleDeleteItem = (item: InventoryItem) => {
    const confirmation = window.confirm(`Remover o item "${item.partName}" do estoque?`);
    if (!confirmation) return;
    deleteItemMutation.mutate(item.id);
  };

  const handleRefreshAvailability = async () => {
    const { partId, vehicleId, clientId } = availabilityIds;
    const newState: AvailabilityState = {};

    if (partId) {
      newState.part = await inventoryApi.getPartAvailability(partId);
    }
    if (vehicleId) {
      newState.vehicle = await inventoryApi.getVehicleAvailability(vehicleId);
    }
    if (clientId) {
      newState.client = await inventoryApi.getClientAvailability(clientId);
    }

    setAvailabilityData(newState);
  };

  const handleRefreshHistory = async () => {
    const { vehicleId, clientId } = historyIds;
    const newState: HistoryState = {};

    if (vehicleId) {
      newState.vehicle = await inventoryApi.getVehicleHistory(vehicleId);
    }

    if (clientId) {
      newState.client = await inventoryApi.getClientHistory(clientId);
    }

    setHistoryData(newState);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-orangeWheel-500">
              <span>📦</span>
              Estoque Inteligente
            </h1>
            <p className="text-sm text-gray-500">Acompanhe quantidades, movimentações e recomendações inteligentes de peças.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-orangeWheel-500 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === "items" && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SectionCard title="Itens monitorados" value={String(totalItems)} />
            <SectionCard title="Itens críticos" value={String(lowStockItems)} highlight={lowStockItems > 0} />
            <SectionCard title="Valor total em estoque" value={formatCurrency(totalStockValue)} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar por peça, localização ou status"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200 md:w-80"
              />
              <RoleGuard roles={["ADMIN"]}>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600"
                  >
                    ➕ Novo item
                  </button>
                </div>
              </RoleGuard>
            </div>

            {isLoadingItems ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orangeWheel-500 border-t-transparent" />
              </div>
            ) : itemsError ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Não foi possível carregar os itens de estoque.
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Peça</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Quantidade</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reservado</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Mínimo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Custo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Localização</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredItems.map(item => {
                        const critical = item.availableQuantity <= item.minimumQuantity;
                        return (
                          <tr key={item.id} className={critical ? "bg-red-50" : undefined}>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">{item.partName}</span>
                                <span className="text-xs text-gray-500">ID Peça: {item.partId}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.availableQuantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.reservedQuantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.minimumQuantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(item.averageCost ?? 0)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.location ?? "-"}</td>
                            <td className="px-4 py-3 text-right text-sm">
                              <RoleGuard roles={["ADMIN"]}>
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsEditModalOpen(true);
                                    }}
                                    className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(item)}
                                    className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </RoleGuard>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                            Nenhum item encontrado para os filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {criticalParts.length > 0 && (
            <div className="rounded-lg border border-orangeWheel-200 bg-orangeWheel-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-orangeWheel-700">Peças com estoque crítico</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {criticalParts.map(recommendation => (
                  <div key={recommendation.id} className="rounded-lg border border-orangeWheel-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">{recommendation.partName ?? recommendation.id}</p>
                    {recommendation.description && (
                      <p className="mt-1 text-xs text-gray-500">{recommendation.description}</p>
                    )}
                    {recommendation.suggestedQuantity && (
                      <p className="mt-2 text-xs text-gray-500">Sugestão: {recommendation.suggestedQuantity} unidades</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "movements" && (
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <RoleGuard roles={["ADMIN"]}>
              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800">Registrar movimentação</h3>
                <MovementForm
                  title="Entrada de estoque"
                  description="Atualize o estoque com novas peças recebidas."
                  isLoading={entryMutation.isPending}
                  onSubmit={async ({ partId, quantity, cost, notes }) => {
                    await entryMutation.mutateAsync({ partId, quantity, cost, notes });
                    void refetchMovements();
                  }}
                  fields={["partId", "quantity", "cost", "notes"]}
                />
                <MovementForm
                  title="Reserva para OS"
                  description="Reserve peças para uma ordem de serviço."
                  isLoading={reserveMutation.isPending}
                  onSubmit={async ({ partId, quantity, serviceOrderId }) => {
                    await reserveMutation.mutateAsync({ partId, quantity, serviceOrderId });
                    void refetchMovements();
                  }}
                  fields={["partId", "quantity", "serviceOrderId"]}
                />
                <MovementForm
                  title="Consumo de reserva"
                  description="Confirme o consumo das peças reservadas."
                  isLoading={consumeMutation.isPending}
                  onSubmit={async ({ reservationId, quantity, notes }) => {
                    await consumeMutation.mutateAsync({ reservationId, quantity, notes });
                    void refetchMovements();
                  }}
                  fields={["reservationId", "quantity", "notes"]}
                />
                <MovementForm
                  title="Cancelar reserva"
                  description="Libere peças reservadas para outras OS."
                  isLoading={cancelReservationMutation.isPending}
                  onSubmit={async ({ reservationId, reason }) => {
                    await cancelReservationMutation.mutateAsync({ reservationId, reason });
                    void refetchMovements();
                  }}
                  fields={["reservationId", "reason"]}
                />
                <MovementForm
                  title="Devolução"
                  description="Registre a devolução de peças ao estoque."
                  isLoading={returnMutation.isPending}
                  onSubmit={async ({ partId, quantity, serviceOrderId, notes }) => {
                    await returnMutation.mutateAsync({ partId, quantity, serviceOrderId, notes });
                    void refetchMovements();
                  }}
                  fields={["partId", "quantity", "serviceOrderId", "notes"]}
                />
              </div>
            </RoleGuard>

            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">Movimentações recentes</h3>
                <button
                  type="button"
                  onClick={() => void refetchMovements()}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  Atualizar
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <FilterInput
                  label="ID da peça"
                  value={movementFilters.partId ?? ""}
                  onChange={value => setMovementFilters(prev => ({ ...prev, partId: value ? Number(value) : undefined }))}
                />
                <FilterInput
                  label="ID da OS"
                  value={movementFilters.serviceOrderId ?? ""}
                  onChange={value => setMovementFilters(prev => ({ ...prev, serviceOrderId: value ? Number(value) : undefined }))}
                />
                <FilterInput
                  label="ID do veículo"
                  value={movementFilters.vehicleId ?? ""}
                  onChange={value => setMovementFilters(prev => ({ ...prev, vehicleId: value ? Number(value) : undefined }))}
                />
              </div>

              <div className="mt-2 max-h-96 space-y-3 overflow-y-auto pr-2">
                {isFetchingMovements ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-orangeWheel-500 border-t-transparent" />
                  </div>
                ) : movements.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    Nenhuma movimentação encontrada para os filtros atuais.
                  </div>
                ) : (
                  movements.map(movement => (
                    <article key={movement.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{movement.movementType}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(movement.occurredAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Quantidade: {movement.quantity}</p>
                      {movement.partName && (
                        <p className="text-xs text-gray-500">Peça: {movement.partName}</p>
                      )}
                      {movement.serviceOrderId && (
                        <p className="text-xs text-gray-500">OS relacionada: {movement.serviceOrderId}</p>
                      )}
                      {movement.notes && (
                        <p className="text-xs text-gray-400">Observações: {movement.notes}</p>
                      )}
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "recommendations" && (
        <section className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-4">
              <FilterInput
                label="ID do veículo"
                value={recommendationFilters.vehicleId ?? ""}
                onChange={value => setRecommendationFilters(prev => ({ ...prev, vehicleId: value ? Number(value) : undefined }))}
              />
              <FilterInput
                label="ID da OS"
                value={recommendationFilters.serviceOrderId ?? ""}
                onChange={value => setRecommendationFilters(prev => ({ ...prev, serviceOrderId: value ? Number(value) : undefined }))}
              />
              <FilterInput
                label="Limite"
                value={recommendationFilters.limit ?? 5}
                onChange={value => setRecommendationFilters(prev => ({ ...prev, limit: value ? Number(value) : undefined }))}
              />
              <div className="flex flex-col text-sm">
                <label className="text-xs font-medium text-gray-600">Pipeline</label>
                <select
                  value={recommendationFilters.pipelineId ?? ""}
                  onChange={event => setRecommendationFilters(prev => ({
                    ...prev,
                    pipelineId: event.target.value || undefined,
                  }))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                >
                  <option value="">Padrão</option>
                  {pipelines.map(pipeline => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => void refetchRecommendations()}
                className="self-end rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Aplicar filtros
              </button>
            </div>

            {isFetchingRecommendations ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orangeWheel-500 border-t-transparent" />
              </div>
            ) : recommendations.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Nenhuma recomendação encontrada para os filtros selecionados.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map(recommendation => (
                  <article key={recommendation.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800">
                      {recommendation.partName ?? `Sugestão ${recommendation.id}`}
                    </h3>
                    {recommendation.description && (
                      <p className="mt-2 text-sm text-gray-600">{recommendation.description}</p>
                    )}
                    {recommendation.suggestedQuantity && (
                      <p className="mt-3 text-xs text-gray-500">Quantidade sugerida: {recommendation.suggestedQuantity}</p>
                    )}
                    {recommendation.priorityScore && (
                      <p className="mt-1 text-xs text-gray-400">Prioridade: {recommendation.priorityScore.toFixed(2)}</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "availability" && (
        <section className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-800">Consultar disponibilidade</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <FilterInput
                label="ID da peça"
                value={availabilityIds.partId ?? ""}
                onChange={value => setAvailabilityIds(prev => ({ ...prev, partId: value ? Number(value) : undefined }))}
              />
              <FilterInput
                label="ID do veículo"
                value={availabilityIds.vehicleId ?? ""}
                onChange={value => setAvailabilityIds(prev => ({ ...prev, vehicleId: value ? Number(value) : undefined }))}
              />
              <FilterInput
                label="ID do cliente"
                value={availabilityIds.clientId ?? ""}
                onChange={value => setAvailabilityIds(prev => ({ ...prev, clientId: value ? Number(value) : undefined }))}
              />
            </div>
            <button
              type="button"
              onClick={() => void handleRefreshAvailability()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600"
            >
              Consultar
            </button>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {availabilityData.part && (
                <AvailabilityCard title="Disponibilidade da peça" data={availabilityData.part} />
              )}
              {availabilityData.vehicle && (
                <AvailabilityCard title="Disponibilidade para o veículo" data={availabilityData.vehicle} />
              )}
              {availabilityData.client && (
                <AvailabilityCard title="Disponibilidade para o cliente" data={availabilityData.client} />
              )}
              {!availabilityData.part && !availabilityData.vehicle && !availabilityData.client && (
                <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                  Informe pelo menos um identificador para consultar.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === "history" && (
        <section className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-800">Histórico de consumo</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FilterInput
                label="ID do veículo"
                value={historyIds.vehicleId ?? ""}
                onChange={value => setHistoryIds(prev => ({ ...prev, vehicleId: value ? Number(value) : undefined }))}
              />
              <FilterInput
                label="ID do cliente"
                value={historyIds.clientId ?? ""}
                onChange={value => setHistoryIds(prev => ({ ...prev, clientId: value ? Number(value) : undefined }))}
              />
            </div>
            <button
              type="button"
              onClick={() => void handleRefreshHistory()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600"
            >
              Consultar histórico
            </button>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {historyData.vehicle && (
                <HistoryCard title="Consumo por veículo" entries={historyData.vehicle} />
              )}
              {historyData.client && (
                <HistoryCard title="Consumo por cliente" entries={historyData.client} />
              )}
              {!historyData.vehicle && !historyData.client && (
                <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                  Nenhum histórico carregado. Informe um veículo ou cliente.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <InventoryItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async data => {
          await createItemMutation.mutateAsync(data);
        }}
        title="Adicionar item ao estoque"
        isSubmitting={createItemMutation.isPending}
      />

      <InventoryItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async data => {
          if (!selectedItem) return;
          await updateItemMutation.mutateAsync({ id: selectedItem.id, data });
        }}
        title="Editar item de estoque"
        initialData={selectedItem}
        isSubmitting={updateItemMutation.isPending}
      />
    </div>
  );
}

function MovementForm({
  title,
  description,
  fields,
  onSubmit,
  isLoading,
}: {
  title: string;
  description: string;
  fields: Array<"partId" | "quantity" | "cost" | "notes" | "serviceOrderId" | "reservationId" | "reason">;
  onSubmit: (payload: Record<string, number | string | undefined>) => Promise<void> | void;
  isLoading?: boolean;
}) {
  const [formState, setFormState] = useState<Record<string, string>>(Object.fromEntries(fields.map(field => [field, ""])));
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const payload: Record<string, number | string | undefined> = {};

    for (const field of fields) {
      const rawValue = formState[field];
      if (!rawValue && ["partId", "quantity", "serviceOrderId", "reservationId"].includes(field)) {
        setError("Preencha os campos obrigatórios");
        return;
      }

      if (rawValue) {
        payload[field] = ["notes", "reason"].includes(field) ? rawValue : Number(rawValue);
      }
    }

    await onSubmit(payload);
    setFormState(Object.fromEntries(fields.map(field => [field, ""])));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <p className="mb-3 text-xs text-gray-500">{description}</p>
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {fields.map(field => (
          <div key={field} className="flex flex-col text-sm">
            <label className="text-xs font-medium text-gray-600">
              {field === "partId" && "ID da peça"}
              {field === "quantity" && "Quantidade"}
              {field === "cost" && "Custo (R$)"}
              {field === "notes" && "Observações"}
              {field === "serviceOrderId" && "ID da OS"}
              {field === "reservationId" && "ID da reserva"}
              {field === "reason" && "Motivo"}
            </label>
            {field === "notes" || field === "reason" ? (
              <textarea
                rows={2}
                value={formState[field] ?? ""}
                onChange={event => handleChange(field, event.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              />
            ) : (
              <input
                type="number"
                step={field === "cost" ? "0.01" : "1"}
                min={field === "quantity" || field === "cost" ? 0 : undefined}
                value={formState[field] ?? ""}
                onChange={event => handleChange(field, event.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processando...
          </>
        ) : (
          <>Confirmar</>
        )}
      </button>
    </form>
  );
}

function FilterInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col text-sm">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        type="number"
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
      />
    </div>
  );
}

function AvailabilityCard({ title, data }: { title: string; data: InventoryAvailability }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-500">Disponível</p>
          <p className="font-semibold text-gray-800">{data.totalAvailable}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Reservado</p>
          <p className="font-semibold text-gray-800">{data.reserved}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Pendente</p>
          <p className="font-semibold text-gray-800">{data.pending}</p>
        </div>
      </div>
      {data.breakdown && data.breakdown.length > 0 && (
        <div className="mt-3 space-y-1 text-xs text-gray-500">
          {data.breakdown.map((location, index) => (
            <div key={`${location.location}-${index}`} className="flex justify-between">
              <span>{location.location}</span>
              <span>{location.available}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ title, entries }: { title: string; entries: InventoryHistoryEntry[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-2">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum lançamento encontrado.</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(entry.occurredAt).toLocaleDateString("pt-BR")}</span>
                <span>{entry.movementType}</span>
              </div>
              <p className="mt-1 font-semibold text-gray-800">{entry.partName ?? `ID ${entry.id}`}</p>
              <p className="text-xs text-gray-500">Quantidade: {entry.quantity}</p>
              {entry.notes && <p className="text-xs text-gray-400">{entry.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
