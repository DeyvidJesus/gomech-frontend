import { clientsApi } from "../../../modules/client/services/api";
import { vehiclesApi } from "../../../modules/vehicle/services/api";

// Palavras-chave para diferentes entidades do sistema
const CONTEXT_KEYWORDS = {
  clients: [
    'cliente', 'clientes', 'customer', 'customers',
    'cpf', 'cnpj', 'documento', 'nome do cliente', 'dados do cliente',
    'telefone', 'email', 'contato', 'endereço', 'endereco',
    'cadastro cliente', 'cadastrar cliente', 'criar cliente',
    'atualizar cliente', 'editar cliente', 'excluir cliente',
    'buscar cliente', 'encontrar cliente', 'listar clientes',
    'informações do cliente', 'dados pessoais', 'histórico do cliente'
  ],
  vehicles: [
    'veículo', 'veiculos', 'veiculo', 'veículos', 'vehicle', 'vehicles',
    'carro', 'carros', 'moto', 'motos', 'automóvel', 'automovel',
    'placa', 'chassi', 'modelo', 'marca', 'ano', 'cor',
    'cadastrar veículo', 'cadastrar veiculo', 'criar veículo',
    'editar veículo', 'atualizar veículo', 'excluir veículo',
    'buscar veículo', 'listar veículos', 'veículos do cliente'
  ],
  serviceOrders: [
    'ordem de serviço', 'ordem de servico', 'ordens de serviço',
    'os', 'serviço', 'servico', 'serviços', 'servicos',
    'manutenção', 'manutencao', 'reparo', 'reparos', 'conserto',
    'mecânico', 'mecanico', 'oficina', 'trabalho', 'trabalhos',
    'criar os', 'nova ordem', 'editar ordem', 'finalizar ordem',
    'buscar ordem', 'listar ordens', 'histórico de serviços'
  ]
};

// Palavras-chave para operações
const OPERATION_KEYWORDS = {
  list: ['listar', 'todos', 'todas', 'lista', 'mostrar', 'exibir', 'ver', 'visualizar'],
  search: ['buscar', 'encontrar', 'procurar', 'localizar', 'pesquisar', 'filtrar'],
  create: ['criar', 'cadastrar', 'adicionar', 'novo', 'nova', 'registrar'],
  update: ['atualizar', 'editar', 'modificar', 'alterar', 'mudar'],
  delete: ['excluir', 'deletar', 'remover', 'apagar', 'eliminar'],
  count: ['quantos', 'quantas', 'total', 'contador', 'número', 'numero'],
  summary: ['resumo', 'relatório', 'relatorio', 'overview', 'sumário', 'sumario']
};

interface SystemContext {
  hasContext: boolean;
  entities: string[];
  operation?: string;
  data: {
    clients?: any[];
    vehicles?: any[];
    serviceOrders?: any[];
  };
  contextMessage: string;
}

/**
 * Detecta que entidades estão sendo referenciadas no prompt
 */
export function detectEntities(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  const detectedEntities: string[] = [];

  for (const [entity, keywords] of Object.entries(CONTEXT_KEYWORDS)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      detectedEntities.push(entity);
    }
  }

  return detectedEntities;
}

/**
 * Detecta o tipo de operação solicitada
 */
export function detectOperation(prompt: string): string | undefined {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [operation, keywords] of Object.entries(OPERATION_KEYWORDS)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return operation;
    }
  }
  
  return undefined;
}

/**
 * Busca contexto completo do sistema baseado no prompt
 */
export async function getSystemContext(prompt: string): Promise<SystemContext> {
  const entities = detectEntities(prompt);
  
  if (entities.length === 0) {
    return {
      hasContext: false,
      entities: [],
      data: {},
      contextMessage: ''
    };
  }

  const operation = detectOperation(prompt);
  const data: any = {};
  
  try {
    // Buscar dados das entidades detectadas
    const promises = [];
    
    if (entities.includes('clients')) {
      promises.push(
        clientsApi.getAll()
          .then(response => ({ type: 'clients', data: response.data }))
          .catch(() => ({ type: 'clients', data: [] }))
      );
    }
    
    if (entities.includes('vehicles')) {
      promises.push(
        vehiclesApi.getAll()
          .then(response => ({ type: 'vehicles', data: response.data }))
          .catch(() => ({ type: 'vehicles', data: [] }))
      );
    }
    
    if (entities.includes('serviceOrders')) {
      promises.push(
        // serviceOrdersApi.getAll()
        //   .then(response => ({ type: 'serviceOrders', data: response.data }))
        //   .catch(() => ({ type: 'serviceOrders', data: [] }))
      );
    }

    const results = await Promise.all(promises);
    
    // Organizar dados por tipo
    results.forEach(result => {
      data[result.type] = result.data;
    });

    const contextMessage = createSystemContextMessage(entities, data, operation);

    return {
      hasContext: true,
      entities,
      operation,
      data,
      contextMessage
    };

  } catch (error) {
    console.error('Erro ao buscar contexto do sistema:', error);
    
    return {
      hasContext: true,
      entities,
      data: {},
      contextMessage: `Erro ao carregar dados de ${entities.join(', ')}. Responda com base nas informações fornecidas pelo usuário.`
    };
  }
}

/**
 * Cria mensagem de contexto formatada para múltiplas entidades
 */
function createSystemContextMessage(entities: string[], data: any, operation?: string): string {
  let context = 'CONTEXTO DO SISTEMA:\n\n';
  
  // Adicionar informações de clientes
  if (entities.includes('clients') && data.clients) {
    context += `📋 CLIENTES (${data.clients.length} no sistema):\n`;
    if (data.clients.length > 0) {
      data.clients.forEach((client: any, index: number) => {
        context += `${index + 1}. ${client.name} - Doc: ${client.document}`;
        if (client.email) context += ` - Email: ${client.email}`;
        if (client.phone) context += ` - Tel: ${client.phone}`;
        if (client.vehicles && client.vehicles.length > 0) {
          context += ` - Veículos: ${client.vehicles.map((v: any) => v.licensePlate).join(', ')}`;
        }
        context += '\n';
      });
    } else {
      context += 'Nenhum cliente cadastrado.\n';
    }
    context += '\n';
  }
  
  // Adicionar informações de veículos
  if (entities.includes('vehicles') && data.vehicles) {
    context += `🚗 VEÍCULOS (${data.vehicles.length} no sistema):\n`;
    if (data.vehicles.length > 0) {
      data.vehicles.forEach((vehicle: any, index: number) => {
        context += `${index + 1}. Placa: ${vehicle.licensePlate || 'N/A'}`;
        if (vehicle.model) context += ` - Modelo: ${vehicle.model}`;
        if (vehicle.brand) context += ` - Marca: ${vehicle.brand}`;
        if (vehicle.year) context += ` - Ano: ${vehicle.year}`;
        if (vehicle.clientName) context += ` - Proprietário: ${vehicle.clientName}`;
        context += '\n';
      });
    } else {
      context += 'Nenhum veículo cadastrado.\n';
    }
    context += '\n';
  }
  
  // Adicionar informações de ordens de serviço
  if (entities.includes('serviceOrders') && data.serviceOrders) {
    context += `🔧 ORDENS DE SERVIÇO (${data.serviceOrders.length} no sistema):\n`;
    if (data.serviceOrders.length > 0) {
      data.serviceOrders.forEach((order: any, index: number) => {
        context += `${index + 1}. OS #${order.id || index + 1}`;
        if (order.description) context += ` - ${order.description}`;
        if (order.status) context += ` - Status: ${order.status}`;
        if (order.clientName) context += ` - Cliente: ${order.clientName}`;
        if (order.vehiclePlate) context += ` - Veículo: ${order.vehiclePlate}`;
        context += '\n';
      });
    } else {
      context += 'Nenhuma ordem de serviço cadastrada.\n';
    }
    context += '\n';
  }

  context += 'INSTRUÇÕES: Use essas informações para responder questões específicas sobre o sistema. ';
  context += 'Para operações como criar, editar ou excluir, forneça orientações baseadas no sistema atual. ';
  
  if (operation) {
    context += `Operação detectada: ${operation}. `;
  }
  
  context += 'Seja específico e use os dados reais mostrados acima.';

  return context;
}

/**
 * Formata o prompt final com contexto do sistema
 */
export function formatPromptWithSystemContext(originalPrompt: string, context: SystemContext): string {
  if (!context.hasContext) {
    return originalPrompt;
  }

  return `${context.contextMessage}\n\n===== PERGUNTA DO USUÁRIO =====\n${originalPrompt}`;
}
