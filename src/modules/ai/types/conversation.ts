export interface Message {
  content: string;
  status: string;
  timestamp: Date;
  chart?: string; // Base64 image data
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  threadId?: string;
}

export interface ConversationHistory {
  conversations: Conversation[];
  activeConversationId: string | null;
}
