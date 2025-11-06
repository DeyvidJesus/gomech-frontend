import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import RoleGuard from "../../auth/components/RoleGuard";
import { ImportInstructionsModal } from "../../../shared/components/ImportInstructionsModal";
import { partsApi } from "../services/api";
import type { Part, PartCreateDTO, PartUpdateDTO } from "../types/part";
import { PartFormModal } from "./PartFormModal";
import { PartImportModal } from "./PartImportModal";
import { PageTutorial } from "@/modules/tutorial/components/PageTutorial";

export default function PartList() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [search, setSearch] = useState("");
  const [downloadingTemplate, setDownloadingTemplate] = useState<string | null>(null);

  const {
    data: parts = [],
    isLoading,
    error,
  } = useQuery<Part[]>({
    queryKey: ["parts"],
    queryFn: partsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (payload: PartCreateDTO) => partsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PartUpdateDTO }) => partsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => partsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => partsApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

  const filteredParts = useMemo(() => {
    if (!search.trim()) {
      return parts;
    }

    const term = search.toLowerCase();
    return parts.filter(part =>
      [part.name, part.sku, part.manufacturer, part.description]
        .filter(Boolean)
        .some(value => value?.toLowerCase().includes(term)),
    );
  }, [parts, search]);

  const totalParts = parts.length;

  const handleDelete = (part: Part) => {
    const confirmation = window.confirm(
      `Tem certeza que deseja remover a peça "${part.name}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmation) {
      return;
    }

    deleteMutation.mutate(part.id);
  };

  const handleImport = async (file: File) => {
    await importMutation.mutateAsync(file);
  };

  const downloadTemplate = async (format: "xlsx" | "csv") => {
    try {
      setDownloadingTemplate(format);
      const response = await partsApi.downloadTemplate(format);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `template_pecas.${format}`;
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

  const tutorial = (
    <PageTutorial
      tutorialKey="parts-catalog"
      title="Domine o catálogo de peças"
      description="Veja como manter o catálogo organizado para alimentar o estoque e as ordens de serviço."
      steps={[
        {
          title: 'Busca e filtros',
          description: 'Utilize o campo de busca para localizar peças por nome, SKU, fabricante ou descrição.',
          icon: '🔍',
        },
        {
          title: 'Cadastro e importação',
          description: 'Cadastre peças manualmente ou importe planilhas usando o modelo disponível.',
          icon: '📦',
        },
        {
          title: 'Gestão avançada',
          description: 'Defina preços, estoque mínimo e ative/desative peças conforme sua estratégia.',
          icon: '⚙️',
        },
      ]}
    />
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        {tutorial}
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orangeWheel-500 border-t-transparent" />
          <p className="text-sm text-gray-600">Carregando catálogo de peças...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {tutorial}
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-semibold text-red-600">Não foi possível carregar as peças</p>
          <p className="text-sm text-red-500">Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tutorial}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-orangeWheel-500">
                <span>🧰</span>
                Catálogo de Peças
              </h1>
              <button
                type="button"
                onClick={() => setIsInstructionsModalOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
                title="Ajuda para importação em massa"
              >
                ℹ️ Ajuda
              </button>
            </div>
            <p className="text-sm text-gray-500">Gerencie os itens disponíveis para ordens de serviço e estoque.</p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar por nome, SKU ou fabricante"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200 md:w-64"
            />

            <RoleGuard roles={['ADMIN']}>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-orangeWheel-200 bg-orangeWheel-50 px-4 py-2 text-sm font-medium text-orangeWheel-600 transition-colors hover:bg-orangeWheel-100"
                >
                  ⬆️ Importar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600"
                >
                  ➕ Nova peça
                </button>
              </div>
            </RoleGuard>
          </div>
        </div>
      </div>

      <RoleGuard roles={['ADMIN']}>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                <span>📋</span>
                Cadastro em Massa de Peças
              </h3>
              <p className="text-xs text-blue-600 mt-1">
                Importe várias peças de uma vez usando planilhas Excel ou CSV
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
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Peças cadastradas</p>
          <p className="text-2xl font-bold text-gray-900">{totalParts}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Peças ativas</p>
          <p className="text-2xl font-bold text-gray-900">{parts.filter(part => part.active).length}</p>
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
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredParts.map(part => {
                return (
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
                    <td className="px-4 py-3 text-right">
                      <RoleGuard roles={['ADMIN']}>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPart(part);
                              setIsEditModalOpen(true);
                            }}
                            className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(part)}
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

      <PartFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async data => {
          await createMutation.mutateAsync(data);
        }}
        title="Cadastrar nova peça"
        isSubmitting={createMutation.isPending}
      />

      <PartFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async data => {
          if (!selectedPart) return;
          await updateMutation.mutateAsync({ id: selectedPart.id, data });
        }}
        title="Editar peça"
        initialData={selectedPart}
        isSubmitting={updateMutation.isPending}
      />

      <PartImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onUpload={handleImport}
      />

      <ImportInstructionsModal
        type="parts"
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
        onDownloadTemplate={downloadTemplate}
        isDownloading={downloadingTemplate}
      />
    </div>
  );
}
