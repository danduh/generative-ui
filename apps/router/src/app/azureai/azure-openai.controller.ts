// src/openai/openai.controller.ts
import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { AzureOpenAIService } from './azure-openai.service';
import { Response } from 'express';
import { ApiResponse } from '@nestjs/swagger';
import { QueryDto, ResponseDto } from '../dto/ai-response.dtos';
import { ChatHistoryService } from '../services/chat-history.service';

@Controller('azureai')
export class AzureOpenAIController {
  constructor(
    private readonly azureAIService: AzureOpenAIService,
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
    return this.azureAIService.interactWithAssistant(sessionId, body.query);
  }

  @Post(':sessionId/clear')
  async clearHistory(@Param('sessionId') sessionId: string): Promise<void> {
    this.chatHistory.clearChatHistory(sessionId);
  }
}
