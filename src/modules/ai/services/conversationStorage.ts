import type { Conversation, ConversationHistory, Message } from '../types/conversation'

const STORAGE_KEY = 'gomech_chat_history'
const MAX_CONVERSATIONS = 10

const emptyHistory: ConversationHistory = {
  conversations: [],
  activeConversationId: null,
}

function cloneConversation(conversation: Conversation): Conversation {
  return {
    ...conversation,
    createdAt: new Date(conversation.createdAt),
    updatedAt: new Date(conversation.updatedAt),
    messages: conversation.messages.map(message => ({
      ...message,
      timestamp: new Date(message.timestamp),
    })),
  }
}

function cloneHistory(history: ConversationHistory): ConversationHistory {
  return {
    activeConversationId: history.activeConversationId,
    conversations: history.conversations.map(cloneConversation),
  }
}

function reviveHistory(serialized: any): ConversationHistory {
  if (!serialized) {
    return cloneHistory(emptyHistory)
  }

  try {
    return {
      activeConversationId: serialized.activeConversationId ?? null,
      conversations: Array.isArray(serialized.conversations)
        ? serialized.conversations.map((conversation: any) => ({
            ...conversation,
            createdAt: conversation.createdAt ? new Date(conversation.createdAt) : new Date(),
            updatedAt: conversation.updatedAt ? new Date(conversation.updatedAt) : new Date(),
            messages: Array.isArray(conversation.messages)
              ? conversation.messages.map((message: any) => ({
                  ...message,
                  timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
                }))
              : [],
          }))
        : [],
    }
  } catch (error) {
    console.error('Erro ao recuperar histórico de conversas:', error)
    return cloneHistory(emptyHistory)
  }
}

function serializeHistory(history: ConversationHistory) {
  return {
    activeConversationId: history.activeConversationId,
    conversations: history.conversations.map(conversation => ({
      ...conversation,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messages: conversation.messages.map(message => ({
        ...message,
        timestamp: message.timestamp.toISOString(),
      })),
    })),
  }
}

class ConversationStorageService {
  private cache: ConversationHistory = cloneHistory(emptyHistory)
  private hydrated = false

  private ensureHistory() {
    if (this.hydrated) {
      return this.cache
    }

    if (typeof window === 'undefined') {
      this.cache = cloneHistory(emptyHistory)
      this.hydrated = true
      return this.cache
    }

    const stored = window.localStorage.getItem(STORAGE_KEY)
    this.cache = reviveHistory(stored ? JSON.parse(stored) : null)
    this.hydrated = true
    return this.cache
  }

  private persist(history: ConversationHistory) {
    const limitedHistory: ConversationHistory = {
      activeConversationId: history.activeConversationId,
      conversations: [...history.conversations]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, MAX_CONVERSATIONS),
    }

    this.cache = cloneHistory(limitedHistory)

    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeHistory(limitedHistory)))
    } catch (error) {
      console.error('Erro ao salvar histórico de conversas:', error)
    }
  }

  generateConversationTitle(firstMessage: string) {
    const cleaned = firstMessage.trim().slice(0, 50)
    return cleaned.length < firstMessage.length ? `${cleaned}...` : cleaned
  }

  createNewConversation(firstMessage?: string): Conversation {
    const now = new Date()

    return {
      id: `conv_${now.getTime()}_${Math.random().toString(36).slice(2, 11)}`,
      title: firstMessage ? this.generateConversationTitle(firstMessage) : 'Nova Conversa',
      messages: [],
      createdAt: now,
      updatedAt: now,
    }
  }

  getAllConversations(): Conversation[] {
    const history = this.ensureHistory()
    return [...history.conversations].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  getActiveConversationId(): string | null {
    return this.ensureHistory().activeConversationId
  }

  getConversationById(id: string): Conversation | null {
    const history = this.ensureHistory()
    const conversation = history.conversations.find(conv => conv.id === id)
    return conversation ? cloneConversation(conversation) : null
  }

  setActiveConversation(conversationId: string) {
    const history = cloneHistory(this.ensureHistory())
    history.activeConversationId = conversationId
    this.persist(history)
  }

  saveConversation(conversation: Conversation) {
    const history = cloneHistory(this.ensureHistory())
    const updatedConversation = cloneConversation({
      ...conversation,
      updatedAt: new Date(),
    })

    const existingIndex = history.conversations.findIndex(conv => conv.id === conversation.id)

    if (existingIndex >= 0) {
      history.conversations[existingIndex] = updatedConversation
    } else {
      history.conversations.push(updatedConversation)
    }

    this.persist(history)
  }

  addMessageToConversation(conversationId: string, message: Message) {
    const history = cloneHistory(this.ensureHistory())
    const index = history.conversations.findIndex(conv => conv.id === conversationId)

    if (index === -1) {
      return
    }

    const conversation = history.conversations[index]
    const nextConversation: Conversation = {
      ...conversation,
      messages: [...conversation.messages, { ...message, timestamp: new Date(message.timestamp) }],
      updatedAt: new Date(),
    }

    if (nextConversation.messages.length === 1 && message.status === 'user') {
      nextConversation.title = this.generateConversationTitle(message.content)
    }

    history.conversations[index] = nextConversation
    this.persist(history)
  }

  deleteConversation(conversationId: string) {
    const history = cloneHistory(this.ensureHistory())
    history.conversations = history.conversations.filter(conv => conv.id !== conversationId)

    if (history.activeConversationId === conversationId) {
      history.activeConversationId = null
    }

    this.persist(history)
  }

  clearAllConversations() {
    this.cache = cloneHistory(emptyHistory)
    this.hydrated = true

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }
}

export const conversationStorage = new ConversationStorageService()
