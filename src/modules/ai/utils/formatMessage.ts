/**
 * Processa e formata mensagens do chatbot para melhor visualização
 */
export function formatMessage(content: string): string {
  if (!content) return '';

  let formatted = content;

  // Converter quebras de linha \n em <br>
  formatted = formatted.replace(/\\n\\n/g, '<br><br>');
  formatted = formatted.replace(/\\n/g, '<br>');
  formatted = formatted.replace(/\n\n/g, '<br><br>');
  formatted = formatted.replace(/\n/g, '<br>');

  // Converter texto em negrito **texto** em <strong>texto</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Converter listas numeradas com negrito
  formatted = formatted.replace(/^(\d+)\.\s+\*\*(.*?)\*\*:/gm, '<div class="list-item"><span class="list-number">$1.</span> <strong>$2:</strong></div>');
  
  // Converter listas numeradas simples
  formatted = formatted.replace(/^(\d+)\.\s+(.*?):/gm, '<div class="list-item"><span class="list-number">$1.</span> <strong>$2:</strong></div>');
  
  // Converter sub-items com hífen e negrito
  formatted = formatted.replace(/^\s*-\s+\*\*(.*?)\*\*:/gm, '<div class="sub-item">• <strong>$1:</strong></div>');
  
  // Converter sub-items simples com hífen
  formatted = formatted.replace(/^\s*-\s+(.*?):/gm, '<div class="sub-item">• <strong>$1:</strong></div>');

  // Converter itens de lista simples
  formatted = formatted.replace(/^\s*-\s+(.*?)$/gm, '<div class="simple-item">• $1</div>');

  // Tratar descrições após dois pontos (deixar em texto normal)
  formatted = formatted.replace(/<\/strong><br>\s*(.*?)(?=<br>|$)/gm, '</strong> $1');

  // Limpar múltiplas quebras de linha consecutivas
  formatted = formatted.replace(/(<br>\s*){3,}/g, '<br><br>');

  // Adicionar espaçamento após listas
  formatted = formatted.replace(/(<\/div>)(<div class="list-item")/g, '$1<br>$2');

  return formatted;
}
