import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import ProtectedRoute from "../../auth/components/ProtectedRoute";
import RoleGuard from "../../auth/components/RoleGuard";
import { analyticsApi } from "../services/api";
import type { AnalyticsInsight, AnalyticsResponse } from "../types/analytics";
import { PageTutorial } from "@/modules/tutorial/components/PageTutorial";

const metricCatalog = [
  {
    id: "inventory.trends",
    label: "Tendências de estoque",
    description: "Evolução de consumo e reposição por peça e categoria",
    example: { range: "30d" },
  },
  {
    id: "service-orders.performance",
    label: "Performance de ordens de serviço",
    description: "Ciclo médio, margem e itens mais consumidos",
    example: { status: "OPEN", window: "14d" },
  },
  {
    id: "supplier.reliability",
    label: "Confiabilidade de fornecedores",
    description: "Atrasos, devoluções e custo médio por fornecedor",
    example: { period: "quarter" },
  },
];

function formatPayload(example: Record<string, unknown>) {
  return JSON.stringify(example, null, 2);
}

export default function AnalyticsDashboard() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <RoleGuard roles={["ADMIN"]}>
        <AnalyticsDashboardContent />
      </RoleGuard>
    </ProtectedRoute>
  );
}

function AnalyticsDashboardContent() {
  const [selectedMetric, setSelectedMetric] = useState(metricCatalog[0]);
  const [payloadText, setPayloadText] = useState(() => formatPayload(metricCatalog[0].example));
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyticsResponse | null>(null);

  const insightsQuery = useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: analyticsApi.getInsights,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: analyticsApi.send,
    onSuccess: data => {
      setResult(data);
    },
  });

  const insightsByCategory = useMemo(() => {
    const grouped = new Map<string, AnalyticsInsight[]>();
    (insightsQuery.data ?? []).forEach(insight => {
      if (!grouped.has(insight.category)) {
        grouped.set(insight.category, []);
      }
      grouped.get(insight.category)!.push(insight);
    });
    return Array.from(grouped.entries());
  }, [insightsQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    try {
      const parsedPayload = payloadText.trim() ? (JSON.parse(payloadText) as Record<string, unknown>) : {};
      mutation.mutate({ metric: selectedMetric.id, payload: parsedPayload });
    } catch (parseError) {
      setError("Payload inválido. Insira um JSON válido.");
    }
  };

  const hasErrorResult = result?.status === "ERROR";

  return (
    <div className="space-y-6">
      <PageTutorial
        tutorialKey="analytics-dashboard"
        title="Como gerar insights analíticos"
        description="Saiba como consultar métricas, enviar payloads personalizados e acompanhar resultados automáticos."
        steps={[
          {
            title: 'Escolha da métrica',
            description: 'Selecione a métrica desejada e visualize exemplos de payload para começar rapidamente.',
            icon: '📊',
          },
          {
            title: 'Envio de payload',
            description: 'Edite o JSON conforme necessidade e clique em "Gerar relatório" para solicitar ao serviço analítico.',
            icon: '📝',
          },
          {
            title: 'Insights automáticos',
            description: 'Atualize a seção de insights para ver recomendações agrupadas por categoria.',
            icon: '💡',
          },
        ]}
      />
      <header className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-orangeWheel-500">Analytics Operacional</h1>
        <p className="mt-2 text-sm text-gray-500">
          Conecte-se ao serviço analítico para gerar insights sob demanda e alimentar os dashboards da GoMech.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700">Métrica</label>
            <select
              value={selectedMetric.id}
              onChange={event => {
                const metric = metricCatalog.find(option => option.id === event.target.value) ?? metricCatalog[0];
                setSelectedMetric(metric);
                setPayloadText(formatPayload(metric.example));
              }}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
            >
              {metricCatalog.map(metric => (
                <option key={metric.id} value={metric.id}>
                  {metric.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">{selectedMetric.description}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Payload (JSON)</label>
            <textarea
              rows={6}
              value={payloadText}
              onChange={event => setPayloadText(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder={formatPayload(selectedMetric.example)}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {mutation.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processando...
            </>
          ) : (
            <>Gerar relatório</>
          )}
        </button>
      </form>

      {hasErrorResult && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {result?.message ?? "Falha ao gerar o relatório solicitado."}
        </div>
      )}

      {result && !hasErrorResult && (
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Resultado da métrica</h2>
              {result.generatedAt && (
                <p className="text-xs text-gray-500">Gerado em {new Date(result.generatedAt).toLocaleString("pt-BR")}</p>
              )}
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">{result.status}</span>
          </div>
          {result.message && <p className="text-sm text-gray-600">{result.message}</p>}
          <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-green-200">
            {JSON.stringify(result.data ?? {}, null, 2)}
          </pre>
        </section>
      )}

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Insights automáticos</h2>
            <p className="text-sm text-gray-500">Agrupados por categoria para alimentar dashboards temáticos.</p>
          </div>
          <button
            type="button"
            onClick={() => insightsQuery.refetch()}
            className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            Atualizar
          </button>
        </div>

        {insightsQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orangeWheel-500 border-t-transparent" />
          </div>
        ) : insightsByCategory.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Nenhum insight disponível no momento.
          </div>
        ) : (
          <div className="space-y-4">
            {insightsByCategory.map(([category, insights]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{category}</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {insights.map(insight => (
                    <article
                      key={insight.id}
                      className="flex h-full flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="space-y-2">
                        <h4 className="text-base font-semibold text-gray-800">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                      {(insight.updatedAt || insight.createdAt) && (
                        <p className="mt-3 text-xs text-gray-400">
                          Atualizado em {new Date(insight.updatedAt ?? insight.createdAt ?? "").toLocaleString("pt-BR")}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
