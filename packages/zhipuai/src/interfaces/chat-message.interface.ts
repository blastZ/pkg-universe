import { ChatMessageRole } from '../enums/chat-message-role.enum.js';

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
}
