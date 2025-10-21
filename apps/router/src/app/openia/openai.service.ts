import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { frontaiSystemMessage } from './systemPrompts';
import { ChatHistoryService } from '../services/chat-history.service';

@Injectable()
export class OpenAiService {
  private apiUrl!: string;
  private apiKey!: string;
  private model!: string;

  constructor(private configService: ConfigService,
              private chatHistory: ChatHistoryService) {
    this.apiUrl = this.configService.get<string>('OPENAI_URL');
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL_NAME');
  }

  async interactWithAssistant(
    sessionId: string,
    userQuery: string
  ): Promise<any> {
    try {
      const chatHistory = this.chatHistory.getChatHistory(sessionId);
      chatHistory.push({ role: 'user', content: userQuery });
      const payload = {
        model: this.model,
        messages: chatHistory,
        max_tokens: 20000,
        temperature: 0.7, // Adjust temperature for response creativity
      };
      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.post(this.apiUrl, payload, { headers });
      console.log('Response from OpenAI:', response.data);
      const assistantMessage = response.data.choices[0].message.content;
      chatHistory.push({ role: 'assistant', content: assistantMessage });
      return assistantMessage;
    } catch (error) {
      console.error(
        'Error communicating with OpenAI API:',
        error.response?.data || error.message
      );
      throw new HttpException(
        'Failed to get response from OpenAI API',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
