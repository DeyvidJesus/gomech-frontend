import Modal from "./Modal";
import Button from "./Button";

interface ImportInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "clients" | "vehicles" | "parts" | "inventory";
  onDownloadTemplate: (format: "xlsx" | "csv") => void;
  isDownloading: string | null;
}

export function ImportInstructionsModal({
  isOpen,
  onClose,
  type,
  onDownloadTemplate,
  isDownloading,
}: ImportInstructionsModalProps) {
  const isVehicles = type === "vehicles";
  const isParts = type === "parts";
  const isInventory = type === "inventory";
  
  const title = 
    isVehicles ? "🚗 Instruções - Cadastro em Massa de Veículos" :
    isParts ? "🔧 Instruções - Cadastro em Massa de Peças" :
    isInventory ? "📦 Instruções - Cadastro em Massa de Itens de Estoque" :
    "👥 Instruções - Cadastro em Massa de Clientes";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Aprenda a importar dados usando planilhas"
      size="lg"
      headerStyle="default"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <Button variant="outline" onClick={onClose} type="button">
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-5 max-h-[60vh] overflow-y-auto">
        {/* Download Templates */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📥</span>
            1. Baixe o Template
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Escolha o formato preferido e baixe o template:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onDownloadTemplate("xlsx")}
              disabled={!!isDownloading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isDownloading === "xlsx" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Baixando...
                </>
              ) : (
                <>
                  📊 Baixar Template Excel
                </>
              )}
            </button>
            <button
              onClick={() => onDownloadTemplate("csv")}
              disabled={!!isDownloading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isDownloading === "csv" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Baixando...
                </>
              ) : (
                <>
                  📄 Baixar Template CSV
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            💡 <strong>Dica:</strong> O template Excel já vem com uma aba de instruções detalhadas
          </p>
        </div>

        {/* Campos Obrigatórios */}
        <div className="border-l-4 border-orange-500 bg-orange-50 pl-4 pr-4 py-3 rounded-r-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            Campos Obrigatórios
          </h3>
          {isVehicles ? (
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>
                <strong>clientId:</strong> ID do cliente (número) - OBRIGATÓRIO
              </li>
              <li>
                Pelo menos um: <strong>licensePlate</strong> (placa) OU <strong>chassisId</strong> (chassi)
              </li>
            </ul>
          ) : isParts ? (
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>
                <strong>name:</strong> Nome da peça - OBRIGATÓRIO
              </li>
              <li>
                <strong>sku:</strong> Código SKU único - OBRIGATÓRIO
              </li>
            </ul>
          ) : isInventory ? (
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>
                <strong>partId:</strong> ID da peça - OBRIGATÓRIO
              </li>
              <li>
                <strong>location:</strong> Localização física - OBRIGATÓRIO
              </li>
              <li>
                <strong>quantity:</strong> Quantidade em estoque - OBRIGATÓRIO
              </li>
            </ul>
          ) : (
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>
                Pelo menos um: <strong>name</strong> (nome) OU <strong>document</strong> (CPF/CNPJ) OU <strong>email</strong>
              </li>
            </ul>
          )}
        </div>

        {/* Formato dos Campos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span>📝</span>
            Formato dos Campos
          </h3>
          {isVehicles ? (
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• <strong>clientId:</strong> Número inteiro (ex: 1, 2, 3)</li>
              <li>• <strong>licensePlate:</strong> ABC-1234 ou ABC1D234</li>
              <li>• <strong>brand/model:</strong> Texto livre</li>
              <li>• <strong>manufactureDate:</strong> YYYY-MM-DD (ex: 2020-01-15)</li>
              <li>• <strong>color:</strong> Texto livre (ex: Prata, Preto)</li>
              <li>• <strong>kilometers:</strong> Número inteiro</li>
              <li>• <strong>chassisId:</strong> 17 caracteres</li>
            </ul>
          ) : isParts ? (
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• <strong>name:</strong> Texto livre (ex: Filtro de Óleo)</li>
              <li>• <strong>sku:</strong> Código único alfanumérico (ex: FO-001)</li>
              <li>• <strong>manufacturer:</strong> Nome do fabricante</li>
              <li>• <strong>description:</strong> Descrição detalhada</li>
              <li>• <strong>unitCost:</strong> Valor decimal (ex: 25.00)</li>
              <li>• <strong>unitPrice:</strong> Preço de venda (ex: 45.00)</li>
            </ul>
          ) : isInventory ? (
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• <strong>partId:</strong> Número inteiro (ID da peça cadastrada)</li>
              <li>• <strong>location:</strong> Texto livre (ex: Prateleira A1)</li>
              <li>• <strong>quantity:</strong> Número inteiro (quantidade atual)</li>
              <li>• <strong>reservedQuantity:</strong> Número inteiro (qtd reservada)</li>
              <li>• <strong>minimumQuantity:</strong> Número inteiro (estoque mínimo)</li>
              <li>• <strong>unitCost:</strong> Valor decimal (ex: 25.00)</li>
              <li>• <strong>salePrice:</strong> Valor decimal (ex: 45.00)</li>
            </ul>
          ) : (
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• <strong>name:</strong> Nome completo</li>
              <li>• <strong>document:</strong> CPF (11) ou CNPJ (14) sem pontuação</li>
              <li>• <strong>phone:</strong> (XX) XXXXX-XXXX</li>
              <li>• <strong>email:</strong> exemplo@email.com</li>
              <li>• <strong>birthDate:</strong> YYYY-MM-DD (ex: 1990-01-15)</li>
              <li>• <strong>address:</strong> Endereço completo</li>
            </ul>
          )}
        </div>

        {(isVehicles || isInventory) && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <span>🔑</span>
              {isVehicles ? "Como Obter o ID do Cliente?" : "Como Obter o ID da Peça?"}
            </h3>
            {isVehicles ? (
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside ml-2">
                <li>Vá para a tela de <strong>Clientes</strong></li>
                <li>Clique em <strong>"Exportar"</strong> (botão CSV ou XLSX)</li>
                <li>Abra a planilha exportada</li>
                <li>A primeira coluna contém o <strong>ID</strong> de cada cliente</li>
                <li>Use esse ID na coluna <strong>clientId</strong> da planilha de veículos</li>
              </ol>
            ) : (
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside ml-2">
                <li>Vá para a tela de <strong>Peças</strong></li>
                <li>Exporte a lista de peças</li>
                <li>Abra a planilha exportada</li>
                <li>A primeira coluna contém o <strong>ID</strong> de cada peça</li>
                <li>Use esse ID na coluna <strong>partId</strong> da planilha de estoque</li>
              </ol>
            )}
          </div>
        )}

        {/* Passo a Passo */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📋</span>
            Passo a Passo
          </h3>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside ml-2">
            <li>Baixe o template (botão acima)</li>
            <li>Abra no Excel, Google Sheets ou editor de CSV</li>
            <li>
              <strong>Não altere</strong> os nomes das colunas (primeira linha)
            </li>
            <li>A linha amarela é um <strong>exemplo</strong>, pode ser removida</li>
            <li>Preencha seus dados seguindo o formato correto</li>
            <li>Remova linhas completamente vazias</li>
            <li>Salve o arquivo</li>
            <li>
              Na tela de {
                isVehicles ? "Veículos" :
                isParts ? "Peças" :
                isInventory ? "Estoque" :
                "Clientes"
              }, clique em{" "}
              <strong>"Importar"</strong>
            </li>
            <li>Selecione o arquivo e confirme</li>
          </ol>
        </div>

        {/* Dicas */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span>💡</span>
            Dicas Importantes
          </h3>
          <ul className="text-sm text-gray-700 space-y-1.5">
            <li>✅ Linhas vazias serão ignoradas automaticamente</li>
            <li>✅ Teste primeiro com poucos registros (3-5 linhas)</li>
            <li>✅ Datas devem estar no formato YYYY-MM-DD</li>
            <li>✅ Verifique dados duplicados antes de importar</li>
            <li>✅ Mantenha backup dos arquivos originais</li>
            <li>⚠️ Não feche a janela durante a importação</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

