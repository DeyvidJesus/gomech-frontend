import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import RoleGuard from "../../auth/components/RoleGuard";
import ProtectedRoute from "../../auth/components/ProtectedRoute";
import { ImportInstructionsModal } from "../../../shared/components/ImportInstructionsModal";
import { inventoryApi } from "../services/api";
import { partsApi } from "../../part/services/api";
import { serviceOrdersApi, serviceOrderItemsApi } from "../../serviceOrder/services/api";
import { vehiclesApi } from "../../vehicle/services/api";
import { PartFormModal } from "../../part/components/PartFormModal";
import { PartImportModal } from "../../part/components/PartImportModal";
import type { Part, PartCreateDTO, PartUpdateDTO } from "../../part/types/part";
import type {
  CriticalPartReport,
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
import { PageTutorial } from "@/modules/tutorial/components/PageTutorial";

const tabs = [
  { id: "parts", label: "Peças" },
  { id: "items", label: "Itens" },
  { id: "movements", label: "Movimentações" },
  { id: "recommendations", label: "Recomendações" },
  { id: "availability", label: "Disponibilidade" },
  { id: "history", label: "Histórico" },
] as const;

type InventoryTab = (typeof tabs)[number]["id"];

interface AvailabilityState {
  part?: InventoryAvailability | null;
  vehicle?: InventoryAvailability[] | null;
  client?: InventoryAvailability[] | null;
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
  const [activeTab, setActiveTab] = useState<InventoryTab>("parts");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState<string | null>(null);
  
  // Estados para gerenciamento de peças
  const [isCreatePartModalOpen, setIsCreatePartModalOpen] = useState(false);
  const [isEditPartModalOpen, setIsEditPartModalOpen] = useState(false);
  const [isImportPartModalOpen, setIsImportPartModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [partSearch, setPartSearch] = useState("");
  const [movementFilters, setMovementFilters] = useState<{
    itemId?: number;
    partId?: number;
    serviceOrderId?: number;
    vehicleId?: number;
  }>({});
  const [recommendationFilters, setRecommendationFilters] = useState<{ vehicleId?: number; serviceOrderId?: number; limit?: number; pipelineId?: string }>({ limit: 5 });
  const [availabilityIds, setAvailabilityIds] = useState<{ partId?: number; vehicleId?: number; clientId?: number }>({});
  const [availabilityData, setAvailabilityData] = useState<AvailabilityState>({});
  const [historyIds, setHistoryIds] = useState<{ vehicleId?: number; clientId?: number }>({});
  const [historyData, setHistoryData] = useState<HistoryState>({});

  const itemsQuery = useQuery<InventoryItem[]>({
    queryKey: ["inventory", "items"],
    queryFn: () => inventoryApi.getItems(),
  });
  const items = itemsQuery.data ?? [];
  const isLoadingItems = itemsQuery.isLoading;
  const itemsError = itemsQuery.error;

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

  // Mutations para peças
  const createPartMutation = useMutation({
    mutationFn: (payload: PartCreateDTO) => partsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      setIsCreatePartModalOpen(false);
    },
  });

  const updatePartMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PartUpdateDTO }) => partsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      setIsEditPartModalOpen(false);
    },
  });

  const deletePartMutation = useMutation({
    mutationFn: (id: number) => partsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

  const importPartMutation = useMutation({
    mutationFn: (file: File) => partsApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      setIsImportPartModalOpen(false);
    },
  });

  const entryMutation = useMutation({
    mutationFn: inventoryApi.registerEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "criticalParts"] });
    },
  });
  const reserveMutation = useMutation({
    mutationFn: inventoryApi.reserveStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "criticalParts"] });
    },
  });
  const consumeMutation = useMutation({
    mutationFn: inventoryApi.consumeStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "criticalParts"] });
    },
  });
  const cancelReservationMutation = useMutation({
    mutationFn: inventoryApi.cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "criticalParts"] });
    },
  });
  const returnMutation = useMutation({
    mutationFn: inventoryApi.registerReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "criticalParts"] });
    },
  });

  const downloadTemplate = async (format: "xlsx" | "csv") => {
    try {
      setDownloadingTemplate(format);
      const response = await inventoryApi.downloadTemplate(format);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `template_estoque.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar template:", error);
      alert("Erro ao baixar template. Tente novamente.");
    } finally {
      setDownloadingTemplate(null);
    }
  };

  const movementsQuery = useQuery<InventoryMovement[]>({
    queryKey: ["inventory", "movements", movementFilters],
    queryFn: () => inventoryApi.listMovements(movementFilters),
  });
  const movements = movementsQuery.data ?? [];
  const isFetchingMovements = movementsQuery.isFetching;

  const pipelinesQuery = useQuery<RecommendationPipeline[]>({
    queryKey: ["inventory", "pipelines"],
    queryFn: () => inventoryApi.getRecommendationPipelines(),
  });
  const pipelines = pipelinesQuery.data ?? [];

  const recommendationsQuery = useQuery<InventoryRecommendation[]>({
    queryKey: ["inventory", "recommendations", recommendationFilters],
    queryFn: () => inventoryApi.getRecommendations(recommendationFilters),
  });
  const recommendations = recommendationsQuery.data ?? [];
  const isFetchingRecommendations = recommendationsQuery.isFetching;

  const criticalPartsQuery = useQuery<CriticalPartReport[]>({
    queryKey: ["inventory", "criticalParts"],
    queryFn: () => inventoryApi.getCriticalPartsReport(),
  });
  const criticalParts = criticalPartsQuery.data ?? [];

  // Queries para os selects dos formulários
  const partsQuery = useQuery({
    queryKey: ["parts"],
    queryFn: () => partsApi.getAll(),
  });
  const parts = partsQuery.data ?? [];

  const serviceOrdersQuery = useQuery({
    queryKey: ["serviceOrders"],
    queryFn: () => serviceOrdersApi.getAll().then(res => res.data),
  });
  const serviceOrders = serviceOrdersQuery.data ?? [];

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.getAll().then(res => res.data),
  });
  const vehicles = vehiclesQuery.data ?? [];

  // Buscar todos os itens de todas as ordens de serviço para os selects
  const [serviceOrderItems, setServiceOrderItems] = useState<any[]>([]);
  
  // Carregar itens das ordens de serviço quando necessário
  const loadServiceOrderItems = async () => {
    const allItems: any[] = [];
    for (const order of serviceOrders) {
      try {
        const response = await serviceOrderItemsApi.getByServiceOrder(order.id);
        const items = response.data.map((item: any) => ({
          ...item,
          serviceOrderNumber: order.orderNumber,
          serviceOrderId: order.id,
        }));
        allItems.push(...items);
      } catch (error) {
        console.error(`Erro ao carregar itens da OS ${order.id}:`, error);
      }
    }
    setServiceOrderItems(allItems);
  };

  const filteredItems = useMemo(() => {
    if (!search.trim()) {
      return items;
    }

    const term = search.toLowerCase();
    return items.filter(item =>
      [item.partName, item.location]
        .filter(Boolean)
        .some(value => value?.toLowerCase().includes(term)),
    );
  }, [items, search]);

  const filteredParts = useMemo(() => {
    if (!partSearch.trim()) {
      return parts;
    }

    const term = partSearch.toLowerCase();
    return parts.filter(part =>
      [part.name, part.sku, part.manufacturer, part.description]
        .filter(Boolean)
        .some(value => value?.toLowerCase().includes(term)),
    );
  }, [parts, partSearch]);

  const totalItems = items.length;
  const totalParts = parts.length;

  const handleDeleteItem = (item: InventoryItem) => {
    const confirmation = window.confirm(`Remover o item "${item.partName}" do estoque?`);
    if (!confirmation) return;
    deleteItemMutation.mutate(item.id);
  };

  const handleDeletePart = (part: Part) => {
    const confirmation = window.confirm(
      `Tem certeza que deseja remover a peça "${part.name}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmation) return;
    deletePartMutation.mutate(part.id);
  };

  const handleImportParts = async (file: File) => {
    await importPartMutation.mutateAsync(file);
  };

  // Carregar itens das ordens de serviço quando a aba de movimentações for aberta
  useEffect(() => {
    if (activeTab === "movements" && serviceOrders.length > 0 && serviceOrderItems.length === 0) {
      void loadServiceOrderItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, serviceOrders.length]);

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

  const tutorial = (
    <PageTutorial
      tutorialKey="inventory-dashboard"
      title="Explore o hub de estoque"
      description="Controle peças, itens e movimentações para manter o estoque sempre atualizado."
      steps={[
        {
          title: 'Abas temáticas',
          description: 'Navegue entre Peças, Itens, Movimentações e Recomendações para acessar cada módulo rapidamente.',
          icon: '🗂️',
        },
        {
          title: 'Cadastro e importação',
          description: 'Crie itens manualmente ou importe planilhas para acelerar o cadastro em massa.',
          icon: '📥',
        },
        {
          title: 'Integração com OS',
          description: 'Registre entradas, reservas e consumo para manter o estoque sincronizado com as ordens de serviço.',
          icon: '🔄',
        },
      ]}
    />
  );

  return (
    <div className="space-y-6 flex">
      {tutorial}
      <header className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm fixed w-full max-w-[calc(100%-270px)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-orangeWheel-500">
              <span>📦</span>
              Estoque e Peças
            </h1>
            <p className="text-sm text-gray-500">Gerencie peças, estoque, movimentações e recomendações inteligentes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
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

      {activeTab === "parts" && (
        <section className="space-y-6 mt-30 w-full">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-orangeWheel-500">
                  <span>🧰</span>
                  Catálogo de Peças
                </h2>
                <p className="text-sm text-gray-500">Gerencie os itens disponíveis para ordens de serviço e estoque.</p>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <input
                  type="text"
                  value={partSearch}
                  onChange={event => setPartSearch(event.target.value)}
                  placeholder="Buscar por nome, SKU ou fabricante"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200 md:w-64"
                />

                <RoleGuard roles={['ADMIN']}>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsImportPartModalOpen(true)}
                      className="flex items-center gap-2 rounded-lg border border-orangeWheel-200 bg-orangeWheel-50 px-4 py-2 text-sm font-medium text-orangeWheel-600 transition-colors hover:bg-orangeWheel-100"
                    >
                      ⬆️ Importar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatePartModalOpen(true)}
                      className="flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600"
                    >
                      ➕ Nova peça
                    </button>
                  </div>
                </RoleGuard>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Peças cadastradas</p>
              <p className="text-2xl font-bold text-gray-900">{totalParts}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Peças ativas</p>
              <p className="text-2xl font-bold text-gray-900">{parts.filter(part => part.active).length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Peças inativas</p>
              <p className="text-2xl font-bold text-gray-900">{parts.filter(part => !part.active).length}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Peça</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Fabricante</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Custo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Preço</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredParts.map(part => (
                    <tr key={part.id}>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{part.name}</span>
                          {part.description && <span className="text-xs text-gray-500">{part.description}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{part.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{part.manufacturer ?? "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {(part.unitCost ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {(part.unitPrice ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          part.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {part.active ? '✓ Ativa' : '✗ Inativa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RoleGuard roles={['ADMIN']}>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPart(part);
                                setIsEditPartModalOpen(true);
                              }}
                              className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePart(part)}
                              className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                              Remover
                            </button>
                          </div>
                        </RoleGuard>
                      </td>
                    </tr>
                  ))}

                  {filteredParts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                        Nenhuma peça encontrada com os filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === "items" && (
        <section className="space-y-6 mt-30 w-full">
          <RoleGuard roles={['ADMIN']}>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                      <span>📋</span>
                      Cadastro em Massa de Itens de Estoque
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsInstructionsModalOpen(true)}
                      className="flex items-center gap-1 rounded-lg border border-blue-400 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                      title="Ajuda para importação em massa"
                    >
                      ℹ️ Ajuda
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Importe vários itens de estoque de uma vez usando planilhas Excel ou CSV
                  </p>
                  <p className="text-xs text-yellow-700 mt-1 font-medium">
                    ⚠️ Você precisará do <strong>ID da Peça</strong> para cada item (veja as instruções)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => downloadTemplate("xlsx")}
                    disabled={!!downloadingTemplate}
                    className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                  >
                    📥 Baixar Template Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTemplate("csv")}
                    disabled={!!downloadingTemplate}
                    className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                  >
                    📥 Baixar Template CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInstructionsModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
                  >
                    📖 Ver Instruções
                  </button>
                </div>
              </div>
            </div>
          </RoleGuard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SectionCard title="Itens monitorados" value={String(totalItems)} />
            <SectionCard title="Itens críticos" value={String(criticalParts.length)} highlight={criticalParts.length > 0} />
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
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Preço</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Localização</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredItems.map(item => {
                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">{item.partName}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <span>ID Peça: {item.partId}</span>
                                  {item.partCode && <span className="ml-2">SKU: {item.partCode}</span>}
                                  {item.manufacturer && <span className="ml-2">{item.manufacturer}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.reservedQuantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.minimumQuantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(item.unitCost ?? 0)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(item.salePrice ?? 0)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.location}</td>
                            <td className="px-4 py-3 text-left text-sm">
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
                          <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
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
                {criticalParts.map(report => {
                  const criticality = report.availableQuantity < report.minimumQuantity ? "CRITICAL" : 
                                     report.availableQuantity < report.minimumQuantity * 1.5 ? "WARNING" : "STABLE";
                  return (
                    <div key={report.partId} className="rounded-lg border border-orangeWheel-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">{report.partName}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            criticality === "CRITICAL"
                              ? "bg-red-100 text-red-600"
                              : criticality === "WARNING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {criticality}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Disponível: <span className="font-semibold">{report.availableQuantity}</span> | Mínimo:{" "}
                        <span className="font-semibold">{report.minimumQuantity}</span>
                      </p>
                      {report.partSku && (
                        <p className="mt-1 text-xs text-gray-500">SKU: {report.partSku}</p>
                      )}
                      {report.vehicleModel && (
                        <p className="mt-1 text-xs text-gray-500">Modelo: {report.vehicleModel}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Total: {report.totalQuantity} | Reservado: {report.reservedQuantity} | Consumido: {report.totalConsumed}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "movements" && (
        <section className="space-y-6 mt-30 w-full">
          <div className="grid gap-4 md:grid-cols-2">
            <RoleGuard roles={["ADMIN"]}>
              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800">Registrar movimentação</h3>
                <MovementForm
                  title="Entrada de estoque"
                  description="Atualize o estoque com novas peças recebidas."
                  isLoading={entryMutation.isPending}
                  onSubmit={async payload => {
                    const { partId, location, quantity, unitCost, unitPrice, referenceCode, notes } = payload as {
                      partId: number;
                      location: string;
                      quantity: number;
                      unitCost?: number;
                      unitPrice?: number;
                      referenceCode?: string;
                      notes?: string;
                    };
                    await entryMutation.mutateAsync({
                      partId,
                      location,
                      quantity,
                      unitCost,
                      salePrice: unitPrice,
                      referenceCode,
                      notes,
                    });
                  }}
                  fields={[
                    {
                      name: 'partId',
                      type: 'select',
                      label: 'Peça',
                      required: true,
                      options: parts.map(part => ({
                        value: part.id,
                        label: `${part.name} (SKU: ${part.sku})`
                      }))
                    },
                    {
                      name: 'location',
                      type: 'text',
                      label: 'Localização',
                      placeholder: 'Ex: Prateleira A1',
                      required: true
                    },
                    {
                      name: 'quantity',
                      type: 'number',
                      label: 'Quantidade',
                      required: true
                    },
                    {
                      name: 'unitCost',
                      type: 'number',
                      label: 'Custo unitário (R$)',
                      required: false
                    },
                    {
                      name: 'unitPrice',
                      type: 'number',
                      label: 'Preço de venda (R$)',
                      required: false
                    },
                    {
                      name: 'referenceCode',
                      type: 'text',
                      label: 'Código de referência',
                      placeholder: 'Ex: NF-2024-001',
                      required: false
                    },
                    {
                      name: 'notes',
                      type: 'textarea',
                      label: 'Observações',
                      required: false
                    }
                  ]}
                />
                <MovementForm
                  title="Reserva para OS"
                  description="Reserve peças para uma ordem de serviço."
                  isLoading={reserveMutation.isPending}
                  onSubmit={async payload => {
                    const { serviceOrderItemId, quantity, notes } = payload as {
                      serviceOrderItemId: number;
                      quantity: number;
                      notes?: string;
                    };
                    await reserveMutation.mutateAsync({ serviceOrderItemId, quantity, notes });
                  }}
                  fields={[
                    {
                      name: 'serviceOrderItemId',
                      type: 'select',
                      label: 'Item da OS',
                      required: true,
                      options: serviceOrderItems.map(item => ({
                        value: item.id,
                        label: `OS ${item.serviceOrderNumber} - ${item.description} (${item.itemType})`
                      }))
                    },
                    {
                      name: 'quantity',
                      type: 'number',
                      label: 'Quantidade',
                      required: true
                    },
                    {
                      name: 'notes',
                      type: 'textarea',
                      label: 'Observações',
                      required: false
                    }
                  ]}
                />
                <MovementForm
                  title="Consumo de reserva"
                  description="Confirme o consumo das peças reservadas."
                  isLoading={consumeMutation.isPending}
                  onSubmit={async payload => {
                    const { serviceOrderItemId, quantity, notes } = payload as {
                      serviceOrderItemId: number;
                      quantity: number;
                      notes?: string;
                    };
                    await consumeMutation.mutateAsync({ serviceOrderItemId, quantity, notes });
                  }}
                  fields={[
                    {
                      name: 'serviceOrderItemId',
                      type: 'select',
                      label: 'Item da OS',
                      required: true,
                      options: serviceOrderItems.map(item => ({
                        value: item.id,
                        label: `OS ${item.serviceOrderNumber} - ${item.description} (${item.itemType})`
                      }))
                    },
                    {
                      name: 'quantity',
                      type: 'number',
                      label: 'Quantidade',
                      required: true
                    },
                    {
                      name: 'notes',
                      type: 'textarea',
                      label: 'Observações',
                      required: false
                    }
                  ]}
                />
                <MovementForm
                  title="Cancelar reserva"
                  description="Libere peças reservadas para outras OS."
                  isLoading={cancelReservationMutation.isPending}
                  onSubmit={async payload => {
                    const { serviceOrderItemId, quantity, notes } = payload as {
                      serviceOrderItemId: number;
                      quantity: number;
                      notes?: string;
                    };
                    await cancelReservationMutation.mutateAsync({ serviceOrderItemId, quantity, notes });
                  }}
                  fields={[
                    {
                      name: 'serviceOrderItemId',
                      type: 'select',
                      label: 'Item da OS',
                      required: true,
                      options: serviceOrderItems.map(item => ({
                        value: item.id,
                        label: `OS ${item.serviceOrderNumber} - ${item.description} (${item.itemType})`
                      }))
                    },
                    {
                      name: 'quantity',
                      type: 'number',
                      label: 'Quantidade',
                      required: true
                    },
                    {
                      name: 'notes',
                      type: 'textarea',
                      label: 'Observações',
                      required: false
                    }
                  ]}
                />
                <MovementForm
                  title="Devolução"
                  description="Registre a devolução de peças ao estoque."
                  isLoading={returnMutation.isPending}
                  onSubmit={async payload => {
                    const { serviceOrderItemId, quantity, notes } = payload as {
                      serviceOrderItemId: number;
                      quantity: number;
                      notes?: string;
                    };
                    await returnMutation.mutateAsync({ serviceOrderItemId, quantity, notes });
                  }}
                  fields={[
                    {
                      name: 'serviceOrderItemId',
                      type: 'select',
                      label: 'Item da OS',
                      required: true,
                      options: serviceOrderItems.map(item => ({
                        value: item.id,
                        label: `OS ${item.serviceOrderNumber} - ${item.description} (${item.itemType})`
                      }))
                    },
                    {
                      name: 'quantity',
                      type: 'number',
                      label: 'Quantidade',
                      required: true
                    },
                    {
                      name: 'notes',
                      type: 'textarea',
                      label: 'Observações',
                      required: false
                    }
                  ]}
                />
              </div>
            </RoleGuard>

            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">Movimentações recentes</h3>
              <button
                type="button"
                onClick={() => void movementsQuery.refetch()}
                className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Atualizar
              </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col text-sm">
                  <label className="text-xs font-medium text-gray-600">Item de estoque</label>
                  <select
                    value={movementFilters.itemId ?? ""}
                    onChange={event => setMovementFilters(prev => ({ ...prev, itemId: event.target.value ? Number(event.target.value) : undefined }))}
                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                  >
                    <option value="">Todos os itens</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.partName} - {item.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-xs font-medium text-gray-600">Peça</label>
                  <select
                    value={movementFilters.partId ?? ""}
                    onChange={event => setMovementFilters(prev => ({ ...prev, partId: event.target.value ? Number(event.target.value) : undefined }))}
                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                  >
                    <option value="">Todas as peças</option>
                    {parts.map(part => (
                      <option key={part.id} value={part.id}>
                        {part.name} (SKU: {part.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-xs font-medium text-gray-600">Ordem de Serviço</label>
                  <select
                    value={movementFilters.serviceOrderId ?? ""}
                    onChange={event => setMovementFilters(prev => ({ ...prev, serviceOrderId: event.target.value ? Number(event.target.value) : undefined }))}
                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                  >
                    <option value="">Todas as OS</option>
                    {serviceOrders.map(order => (
                      <option key={order.id} value={order.id}>
                        {order.orderNumber} - {order.clientName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col text-sm">
                  <label className="text-xs font-medium text-gray-600">Veículo</label>
                  <select
                    value={movementFilters.vehicleId ?? ""}
                    onChange={event => setMovementFilters(prev => ({ ...prev, vehicleId: event.target.value ? Number(event.target.value) : undefined }))}
                    className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                  >
                    <option value="">Todos os veículos</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.model} - {vehicle.licensePlate}
                      </option>
                    ))}
                  </select>
                </div>
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
                          {new Date(movement.movementDate).toLocaleString("pt-BR")}
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
        <section className="space-y-6 mt-30 w-full">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 grid gap-4 md:grid-cols-4">
              <div className="flex flex-col text-sm">
                <label className="text-xs font-medium text-gray-600">Veículo</label>
                <select
                  value={recommendationFilters.vehicleId ?? ""}
                  onChange={event => setRecommendationFilters(prev => ({ ...prev, vehicleId: event.target.value ? Number(event.target.value) : undefined }))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                >
                  <option value="">Todos os veículos</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} - {vehicle.licensePlate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col text-sm">
                <label className="text-xs font-medium text-gray-600">Ordem de Serviço</label>
                <select
                  value={recommendationFilters.serviceOrderId ?? ""}
                  onChange={event => setRecommendationFilters(prev => ({ ...prev, serviceOrderId: event.target.value ? Number(event.target.value) : undefined }))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                >
                  <option value="">Todas as OS</option>
                  {serviceOrders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} - {order.clientName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col text-sm">
                <label className="text-xs font-medium text-gray-600">Limite</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={recommendationFilters.limit ?? 5}
                  onChange={event => setRecommendationFilters(prev => ({ ...prev, limit: event.target.value ? Number(event.target.value) : undefined }))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                />
              </div>
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
                onClick={() => void recommendationsQuery.refetch()}
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
                {recommendations.map((recommendation, index) => (
                  <article key={`${recommendation.partId}-${index}`} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <header className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          {recommendation.partName ?? `Peça ${recommendation.partId}`}
                        </h3>
                        {recommendation.partSku && (
                          <p className="text-xs text-gray-400">SKU: {recommendation.partSku}</p>
                        )}
                      </div>
                      {recommendation.fromFallback && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">
                          Fallback
                        </span>
                      )}
                    </header>
                    {recommendation.rationale && (
                      <p className="text-xs text-gray-500">{recommendation.rationale}</p>
                    )}
                    <div className="mt-auto space-y-1 text-xs text-gray-500">
                      {recommendation.historicalQuantity && (
                        <p>
                          Quantidade histórica: <span className="font-semibold">{recommendation.historicalQuantity}</span>
                        </p>
                      )}
                      {typeof recommendation.confidence === "number" && (
                        <p>Confiança: {(recommendation.confidence * 100).toFixed(0)}%</p>
                      )}
                      {recommendation.lastMovementDate && (
                        <p>Última movimentação: {new Date(recommendation.lastMovementDate).toLocaleDateString("pt-BR")}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "availability" && (
        <section className="space-y-6 mt-30 w-full">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-800">Consultar disponibilidade</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col text-sm">
                <label className="text-xs font-medium text-gray-600">Peça</label>
                <select
                  value={availabilityIds.partId ?? ""}
                  onChange={event => setAvailabilityIds(prev => ({ ...prev, partId: event.target.value ? Number(event.target.value) : undefined }))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                >
                  <option value="">Selecione uma peça...</option>
                  {parts.map(part => (
                    <option key={part.id} value={part.id}>
                      {part.name} (SKU: {part.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col text-sm">
                <label className="text-xs font-medium text-gray-600">Veículo</label>
                <select
                  value={availabilityIds.vehicleId ?? ""}
                  onChange={event => setAvailabilityIds(prev => ({ ...prev, vehicleId: event.target.value ? Number(event.target.value) : undefined }))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                >
                  <option value="">Selecione um veículo...</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} - {vehicle.licensePlate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col text-sm">
                <label className="text-xs font-medium text-gray-600">Cliente</label>
                <select
                  value={availabilityIds.clientId ?? ""}
                  onChange={event => setAvailabilityIds(prev => ({ ...prev, clientId: event.target.value ? Number(event.target.value) : undefined }))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                >
                  <option value="">Selecione um cliente...</option>
                  {serviceOrders.map(order => order.clientName).filter((name, index, self) => name && self.indexOf(name) === index).map((clientName, idx) => {
                    const order = serviceOrders.find(o => o.clientName === clientName);
                    return (
                      <option key={idx} value={order?.clientId}>
                        {clientName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleRefreshAvailability()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600"
            >
              Consultar
            </button>

            <div className="mt-6 space-y-4">
              {availabilityData.part && (
                <AvailabilityCard title="Disponibilidade da peça" data={availabilityData.part} />
              )}
              {availabilityData.vehicle && availabilityData.vehicle.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800">Disponibilidade para o veículo</h4>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availabilityData.vehicle.map((item, idx) => (
                      <AvailabilityCard key={idx} title={item.partName ?? `Peça ${item.partId}`} data={item} />
                    ))}
                  </div>
                </div>
              )}
              {availabilityData.client && availabilityData.client.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800">Disponibilidade para o cliente</h4>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availabilityData.client.map((item, idx) => (
                      <AvailabilityCard key={idx} title={item.partName ?? `Peça ${item.partId}`} data={item} />
                    ))}
                  </div>
                </div>
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
        <section className="space-y-6 mt-30 w-full">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-800">Histórico de consumo</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col text-sm">
                <label className="text-xs font-medium text-gray-600">Veículo</label>
                <select
                  value={historyIds.vehicleId ?? ""}
                  onChange={event => setHistoryIds(prev => ({ ...prev, vehicleId: event.target.value ? Number(event.target.value) : undefined }))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                >
                  <option value="">Selecione um veículo...</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} - {vehicle.licensePlate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col text-sm">
                <label className="text-xs font-medium text-gray-600">Cliente</label>
                <select
                  value={historyIds.clientId ?? ""}
                  onChange={event => setHistoryIds(prev => ({ ...prev, clientId: event.target.value ? Number(event.target.value) : undefined }))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                >
                  <option value="">Selecione um cliente...</option>
                  {serviceOrders.map(order => order.clientName).filter((name, index, self) => name && self.indexOf(name) === index).map((clientName, idx) => {
                    const order = serviceOrders.find(o => o.clientName === clientName);
                    return (
                      <option key={idx} value={order?.clientId}>
                        {clientName}
                      </option>
                    );
                  })}
                </select>
              </div>
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
          const payload: InventoryItemCreateDTO = {
            partId: data.partId,
            minimumQuantity: data.minimumQuantity,
            location: data.location ?? "",
            unitCost: data.averageCost,
            salePrice: data.salePrice,
          };
          await createItemMutation.mutateAsync(payload);
        }}
        title="Adicionar item ao estoque"
        isSubmitting={createItemMutation.isPending}
      />

      <InventoryItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async data => {
          if (!selectedItem) return;
          const payload: InventoryItemUpdateDTO = {
            minimumQuantity: data.minimumQuantity,
            quantity: data.initialQuantity,
            location: data.location,
            unitCost: data.averageCost,
            salePrice: data.salePrice,
          };
          await updateItemMutation.mutateAsync({ id: selectedItem.id, data: payload });
        }}
        title="Editar item de estoque"
        initialData={selectedItem}
        isSubmitting={updateItemMutation.isPending}
      />

      {/* Modais de Peças */}
      <PartFormModal
        isOpen={isCreatePartModalOpen}
        onClose={() => setIsCreatePartModalOpen(false)}
        onSubmit={async data => {
          await createPartMutation.mutateAsync(data);
        }}
        title="Cadastrar nova peça"
        isSubmitting={createPartMutation.isPending}
      />

      <PartFormModal
        isOpen={isEditPartModalOpen}
        onClose={() => setIsEditPartModalOpen(false)}
        onSubmit={async data => {
          if (!selectedPart) return;
          await updatePartMutation.mutateAsync({ id: selectedPart.id, data });
        }}
        title="Editar peça"
        initialData={selectedPart}
        isSubmitting={updatePartMutation.isPending}
      />

      <PartImportModal
        isOpen={isImportPartModalOpen}
        onClose={() => setIsImportPartModalOpen(false)}
        onUpload={handleImportParts}
      />

      <ImportInstructionsModal
        type="inventory"
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
        onDownloadTemplate={downloadTemplate}
        isDownloading={downloadingTemplate}
      />
    </div>
  );
}

interface FieldOption {
  value: string | number;
  label: string;
}

interface FieldConfig {
  name: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
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
  fields: FieldConfig[];
  onSubmit: (payload: Record<string, number | string | undefined>) => Promise<void> | void;
  isLoading?: boolean;
}) {
  const [formState, setFormState] = useState<Record<string, string>>(Object.fromEntries(fields.map(field => [field.name, ""])));
  const [error, setError] = useState<string | null>(null);

  const handleChange = (fieldName: string, value: string) => {
    setFormState(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const payload: Record<string, number | string | undefined> = {};

    for (const field of fields) {
      const rawValue = formState[field.name];
      const isTextField = field.type === 'text' || field.type === 'textarea';
      const isNumericField = field.type === 'number';
      const isRequiredField = field.required ?? false;

      if (!rawValue && isRequiredField) {
        setError("Preencha os campos obrigatórios");
        return;
      }

      if (rawValue && isNumericField) {
        const numericValue = Number(rawValue);
        if (Number.isNaN(numericValue)) {
          setError("Informe valores numéricos válidos");
          return;
        }

        if (field.name === "quantity" && numericValue < 1) {
          setError("A quantidade mínima é 1");
          return;
        }

        if (["itemId", "partId", "serviceOrderItemId"].includes(field.name) && numericValue <= 0) {
          setError("Valores devem ser maiores que zero");
          return;
        }

        if (["unitCost", "unitPrice"].includes(field.name) && numericValue < 0) {
          setError("Valores monetários não podem ser negativos");
          return;
        }

        payload[field.name] = numericValue;
      }

      if (rawValue && isTextField) {
        payload[field.name] = rawValue;
      }

      // Para selects, sempre adicionar o valor convertido
      if (field.type === 'select' && rawValue) {
        payload[field.name] = Number(rawValue);
      }
    }

    try {
      await onSubmit(payload);
      setFormState(Object.fromEntries(fields.map(field => [field.name, ""])));
    } catch (submitError: any) {
      const message = submitError?.response?.data?.message ?? 'Não foi possível registrar a movimentação.';
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <p className="mb-3 text-xs text-gray-500">{description}</p>
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {fields.map(field => (
          <div key={field.name} className="flex flex-col text-sm">
            <label className="text-xs font-medium text-gray-600">
              {field.label}{field.required && " *"}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                rows={2}
                value={formState[field.name] ?? ""}
                onChange={event => handleChange(field.name, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              />
            ) : field.type === 'select' ? (
              <select
                value={formState[field.name] ?? ""}
                onChange={event => handleChange(field.name, event.target.value)}
                required={field.required}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              >
                <option value="">Selecione...</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'text' ? (
              <input
                type="text"
                value={formState[field.name] ?? ""}
                onChange={event => handleChange(field.name, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              />
            ) : (
              <input
                type="number"
                step={["unitCost", "unitPrice"].includes(field.name) ? "0.01" : "1"}
                min={
                  field.name === "quantity"
                    ? 1
                    : ["unitCost", "unitPrice"].includes(field.name)
                      ? 0
                      : ["itemId", "partId", "serviceOrderItemId"].includes(field.name)
                        ? 1
                        : undefined
                }
                value={formState[field.name] ?? ""}
                onChange={event => handleChange(field.name, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
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

function AvailabilityCard({ title, data }: { title: string; data: InventoryAvailability }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      {data.partSku && (
        <p className="text-xs text-gray-500">SKU: {data.partSku}</p>
      )}
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-semibold text-gray-800">{data.totalQuantity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Disponível</p>
          <p className="font-semibold text-gray-800">{data.availableQuantity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Reservado</p>
          <p className="font-semibold text-gray-800">{data.reservedQuantity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Mínimo</p>
          <p className="font-semibold text-gray-800">{data.minimumQuantity}</p>
        </div>
      </div>
      {data.lastMovementDate && (
        <div className="mt-3 text-xs text-gray-500">
          <p>Última movimentação: {new Date(data.lastMovementDate).toLocaleDateString("pt-BR")}</p>
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
              {entry.performedBy && <p className="text-xs text-gray-400">Por: {entry.performedBy}</p>}
              {entry.notes && <p className="text-xs text-gray-400">{entry.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
