import toast from 'react-hot-toast';

/**
 * Extrai a mensagem de erro de uma resposta de erro da API
 * @param error - Erro retornado pela requisição
 * @param defaultMessage - Mensagem padrão caso não seja possível extrair do erro
 * @returns Mensagem de erro formatada
 */
export function extractErrorMessage(error: any, defaultMessage: string = "Erro ao processar requisição"): string {
  // Tenta extrair mensagem do formato do GlobalExceptionHandler
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Tenta extrair mensagem do formato antigo
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Se for um erro de rede
  if (error.message === "Network Error") {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  // Se for timeout
  if (error.code === "ECONNABORTED") {
    return "Requisição expirou. Tente novamente.";
  }

  // Retorna mensagem do erro ou padrão
  return error.message || defaultMessage;
}

/**
 * Exibe um toast de erro com a mensagem extraída
 * @param error - Erro retornado pela requisição
 * @param defaultMessage - Mensagem padrão caso não seja possível extrair do erro
 */
export function showErrorAlert(error: any, defaultMessage?: string): void {
  const message = extractErrorMessage(error, defaultMessage);
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
}

/**
 * Exibe um toast de sucesso
 * @param message - Mensagem de sucesso
 */
export function showSuccessToast(message: string): void {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
}

/**
 * Exibe um toast de informação
 * @param message - Mensagem informativa
 */
export function showInfoToast(message: string): void {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
  });
}

/**
 * Exibe um toast de aviso
 * @param message - Mensagem de aviso
 */
export function showWarningToast(message: string): void {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
  });
}

/**
 * Tipo de retorno para validação de erros de campo
 */
export interface ValidationErrors {
  [field: string]: string;
}

/**
 * Extrai erros de validação de campos
 * @param error - Erro retornado pela requisição
 * @returns Objeto com erros por campo ou null se não houver
 */
export function extractValidationErrors(error: any): ValidationErrors | null {
  if (error.response?.data?.validationErrors) {
    return error.response.data.validationErrors;
  }
  return null;
}

