import type { Conversation, ConversationHistory, Message } from '../types/conversation';

const STORAGE_KEY = 'gomech_chat_history';
const MAX_CONVERSATIONS = 10; // Máximo de conversas mantidas

class ConversationStorageService {
  private getStorageData(): ConversationHistory {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converter strings de data de volta para objetos Date
        parsed.conversations = parsed.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        return parsed;
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de conversas:', error);
    }
    
    return {
      conversations: [],
      activeConversationId: null
    };
  }

  private saveStorageData(data: ConversationHistory): void {
    try {
      // Limitar o número de conversas
      if (data.conversations.length > MAX_CONVERSATIONS) {
        data.conversations = data.conversations
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, MAX_CONVERSATIONS);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar histórico de conversas:', error);
    }
  }

  generateConversationTitle(firstMessage: string): string {
    // Gerar título baseado na primeira mensagem
    const cleaned = firstMessage.trim().slice(0, 50);
    return cleaned.length < firstMessage.length ? `${cleaned}...` : cleaned;
  }

  createNewConversation(firstMessage?: string): Conversation {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    return {
      id,
      title: firstMessage ? this.generateConversationTitle(firstMessage) : 'Nova Conversa',
      messages: [],
      createdAt: now,
      updatedAt: now
    };
  }

  getAllConversations(): Conversation[] {
    const data = this.getStorageData();
    return data.conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getActiveConversationId(): string | null {
    const data = this.getStorageData();
    return data.activeConversationId;
  }

  getConversationById(id: string): Conversation | null {
    const data = this.getStorageData();
    return data.conversations.find(conv => conv.id === id) || null;
  }

  setActiveConversation(conversationId: string): void {
    const data = this.getStorageData();
    data.activeConversationId = conversationId;
    this.saveStorageData(data);
  }

  saveConversation(conversation: Conversation): void {
    const data = this.getStorageData();
    const existingIndex = data.conversations.findIndex(conv => conv.id === conversation.id);
    
    conversation.updatedAt = new Date();
    
    if (existingIndex >= 0) {
      data.conversations[existingIndex] = conversation;
    } else {
      data.conversations.push(conversation);
    }
    
    this.saveStorageData(data);
  }

  addMessageToConversation(conversationId: string, message: Message): void {
    const conversation = this.getConversationById(conversationId);
    if (conversation) {
      conversation.messages.push(message);
      
      // Atualizar título se for a primeira mensagem do usuário
      if (conversation.messages.length === 1 && message.status === 'user') {
        conversation.title = this.generateConversationTitle(message.content);
      }
      
      this.saveConversation(conversation);
    }
  }

  deleteConversation(conversationId: string): void {
    const data = this.getStorageData();
    data.conversations = data.conversations.filter(conv => conv.id !== conversationId);
    
    // Se a conversa ativa foi deletada, limpar
    if (data.activeConversationId === conversationId) {
      data.activeConversationId = null;
    }
    
    this.saveStorageData(data);
  }

  clearAllConversations(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const conversationStorage = new ConversationStorageService();
