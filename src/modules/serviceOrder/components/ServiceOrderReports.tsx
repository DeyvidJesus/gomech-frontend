import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { serviceOrdersApi } from "../services/api";

export default function ServiceOrderReports() {
  // Relatórios
  const { data: overdueReports = [], isLoading: overdueLoading } = useQuery({
    queryKey: ["serviceOrderReports", "overdue"],
    queryFn: () => serviceOrdersApi.getOverdueReports().then(res => res.data),
  });

  const { data: waitingPartsReports = [], isLoading: waitingPartsLoading } = useQuery({
    queryKey: ["serviceOrderReports", "waitingParts"],
    queryFn: () => serviceOrdersApi.getWaitingPartsReports().then(res => res.data),
  });

  const { data: waitingApprovalReports = [], isLoading: waitingApprovalLoading } = useQuery({
    queryKey: ["serviceOrderReports", "waitingApproval"],
    queryFn: () => serviceOrdersApi.getWaitingApprovalReports().then(res => res.data),
  });

  const isLoading = overdueLoading || waitingPartsLoading || waitingApprovalLoading;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600 mb-2">📊 Relatórios de OS</h1>
            <p className="text-gray-600">Acompanhe o status e performance das ordens de serviço</p>
          </div>
          <Link
            to="/service-orders"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📋</span>
            Ver Todas as OS
          </Link>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">OS Atrasadas</h3>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {isLoading ? "..." : overdueReports.length}
          </div>
          <p className="text-sm text-gray-500 mt-2">Requerem atenção imediata</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Aguardando Peças</h3>
            <span className="text-2xl">📦</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {isLoading ? "..." : waitingPartsReports.length}
          </div>
          <p className="text-sm text-gray-500 mt-2">Dependem de estoque</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Aguardando Aprovação</h3>
            <span className="text-2xl">👤</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {isLoading ? "..." : waitingApprovalReports.length}
          </div>
          <p className="text-sm text-gray-500 mt-2">Precisam de autorização</p>
        </div>
      </div>

      {/* OS Atrasadas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            ⚠️ Ordens de Serviço Atrasadas
          </h2>
          <p className="text-gray-600 mt-1">OS que passaram da data estimada de conclusão</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando relatórios...</p>
          </div>
        ) : overdueReports.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl mb-4 block">🎉</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma OS atrasada!</h3>
            <p className="text-gray-600">Todas as ordens estão dentro do prazo estimado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">OS</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dias Atraso</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {overdueReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <div>
                          <div className="font-semibold text-gray-900">#{report.orderNumber}</div>
                          <div className="text-sm text-gray-500">ID: {report.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{report.clientId}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{report.vehicle!.brand} {report.vehicle!.model}</div>
                      <div className="text-sm text-gray-500">{report.vehicle!.licensePlate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {report.daysPastDue}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      R$ {report.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/service-orders/$id"
                        params={{ id: report.id.toString() }}
                        className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OS Aguardando Peças */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            📦 Aguardando Peças
          </h2>
          <p className="text-gray-600 mt-1">OS que dependem de peças em estoque</p>
        </div>

        {waitingPartsReports.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl mb-4 block">✅</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma OS aguardando peças</h3>
            <p className="text-gray-600">Todas as peças necessárias estão disponíveis</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">OS</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Prioridade</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {waitingPartsReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <div>
                          <div className="font-semibold text-gray-900">#{report.orderNumber}</div>
                          <div className="text-sm text-gray-500">ID: {report.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{report.clientId}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{report.vehicle!.brand} {report.vehicle!.model}</div>
                      <div className="text-sm text-gray-500">{report.vehicle!.licensePlate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'WAITING_PARTS' ? 'bg-red-100 text-red-800' :
                        report.status === 'WAITING_APPROVAL' ? 'bg-orange-100 text-orange-800' :
                        report.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status === 'WAITING_PARTS' ? '🚨 Urgente' :
                         report.status === 'WAITING_APPROVAL' ? '⬆️ Alta' :
                         report.status === 'PENDING' ? '➡️ Média' :
                         '⬇️ Baixa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/service-orders/$id"
                        params={{ id: report.id.toString() }}
                        className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OS Aguardando Aprovação */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            👤 Aguardando Aprovação
          </h2>
          <p className="text-gray-600 mt-1">OS que precisam de autorização do cliente</p>
        </div>

        {waitingApprovalReports.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl mb-4 block">✅</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma OS aguardando aprovação</h3>
            <p className="text-gray-600">Todas as aprovações necessárias foram obtidas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">OS</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {waitingApprovalReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        <div>
                          <div className="font-semibold text-gray-900">#{report.orderNumber}</div>
                          <div className="text-sm text-gray-500">ID: {report.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{report.clientId}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{report.vehicle!.brand} {report.vehicle!.model}</div>
                      <div className="text-sm text-gray-500">{report.vehicle!.licensePlate}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      R$ {report.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/service-orders/$id"
                        params={{ id: report.id.toString() }}
                        className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
