import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { analyticsApi } from "../../analytics/services/api";
import type { AnalyticsResponse } from "../../analytics/types/analytics";

export default function AnalyticsPanel() {
  const defaultPayloadExample = '{\n  "range": "30d"\n}';
  const [metric, setMetric] = useState("inventory.trends");
  const [payloadText, setPayloadText] = useState(defaultPayloadExample);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyticsResponse | null>(null);

  const mutation = useMutation({
    mutationFn: analyticsApi.send,
    onSuccess: response => {
      setResult(response.data);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!metric.trim()) {
      setError("Informe a métrica desejada");
      return;
    }

    try {
      const parsedPayload = payloadText.trim() ? JSON.parse(payloadText) : {};
      mutation.mutate({ metric: metric.trim(), payload: parsedPayload });
    } catch (parseError) {
      setError("Payload inválido. Insira um JSON válido.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-orangeWheel-500">Analytics Operacional</h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          Envie solicitações ao serviço Python para gerar relatórios customizados e dashboards avançados.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700">Métrica</label>
            <input
              type="text"
              value={metric}
              onChange={event => setMetric(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder="ex: inventory.trends"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Payload (JSON)</label>
            <textarea
              rows={6}
              value={payloadText}
              onChange={event => setPayloadText(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              placeholder={defaultPayloadExample}
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

      {mutation.isError && !error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(mutation.error as any)?.response?.data?.message ?? "Falha ao gerar o relatório solicitado."}
        </div>
      )}

      {result && (
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Resultado da métrica</h3>
              {result.generatedAt && (
                <p className="text-xs text-gray-500">Gerado em {new Date(result.generatedAt).toLocaleString("pt-BR")}</p>
              )}
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">{result.status}</span>
          </div>
          {result.message && <p className="text-sm text-gray-600">{result.message}</p>}
          <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs sm:text-sm text-green-200">
            {JSON.stringify(result.data ?? {}, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

