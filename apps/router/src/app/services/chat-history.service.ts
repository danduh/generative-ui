import { frontaiSystemMessage } from '../openia/systemPrompts';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatHistoryService {
  private chatHistories: Map<string, Array<{ role: string; content: string }>> =
    new Map();

  // Get or create chat history for a session
  getChatHistory(sessionId: string): Array<{ role: string; content: string }> {
    if (!this.chatHistories.has(sessionId)) {
      this.chatHistories.set(sessionId, [
        {
          role: 'system',
          content: frontaiSystemMessage,
        },
      ]);
    }
    return this.chatHistories.get(sessionId);
  }

  // Clear chat history for a session
  clearChatHistory(sessionId: string): void {
    this.chatHistories.delete(sessionId);
  }
}
