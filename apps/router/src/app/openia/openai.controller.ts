import { Controller, Post, Body, Param } from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { QueryDto, ResponseDto } from '../dto/ai-response.dtos';
import { ApiResponse } from '@nestjs/swagger';
import { ChatHistoryService } from '../services/chat-history.service';

@Controller('openai')
export class OpenAiController {
  constructor(
    private readonly openAiService: OpenAiService,
    private chatHistory: ChatHistoryService
  ) {}

  @Post(':sessionId/query')
  @ApiResponse({
    status: 200,
    description: 'The response from the assistant',
    type: ResponseDto,
  })
  async handleQuery(
    @Param('sessionId') sessionId: string,
    @Body() body: QueryDto
  ): Promise<ResponseDto> {
    return this.openAiService.interactWithAssistant(sessionId, body.query);
  }

  @Post(':sessionId/clear')
  async clearHistory(@Param('sessionId') sessionId: string): Promise<void> {
    this.chatHistory.clearChatHistory(sessionId);
  }
}
