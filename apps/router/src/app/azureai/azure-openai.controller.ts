// src/openai/openai.controller.ts
import { Body, Controller, Param, Post } from '@nestjs/common';
import { AzureOpenAIService } from './azure-openai.service';
import { ApiResponse, ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { QueryDto, ResponseDto } from '../dto/ai-response.dtos';
import { ChatHistoryService } from '../services/chat-history.service';

@ApiTags('Azure OpenAI (Legacy)')
@Controller('azureai')
export class AzureOpenAIController {
  constructor(
    private readonly azureAIService: AzureOpenAIService,
    private chatHistory: ChatHistoryService
  ) {}

  @Post(':sessionId/query')
  @ApiOperation({
    summary: 'Process query with Azure OpenAI',
    description: 'Legacy Azure OpenAI endpoint - processes user query using Azure OpenAI. Consider using MCP endpoints for new integrations.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Unique session identifier for maintaining conversation history',
    example: 'user123',
  })
  @ApiBody({
    type: QueryDto,
    description: 'Query request',
  })
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
  @ApiOperation({
    summary: 'Clear chat history',
    description: 'Clear the conversation history for a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session identifier to clear',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat history cleared successfully',
  })
  async clearHistory(@Param('sessionId') sessionId: string): Promise<void> {
    this.chatHistory.clearChatHistory(sessionId);
  }
}
