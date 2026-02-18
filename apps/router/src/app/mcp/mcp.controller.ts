import { Body, Controller, Param, Post, Get, Logger, Query as QueryParam } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { QueryDto, ResponseDto, McpResponseDto, legacyToMcpResponse } from '../dto/ai-response.dtos';
import { ChatHistoryService } from '../services/chat-history.service';
import { McpOrchestratorService } from './mcp-orchestrator.service';

@ApiTags('MCP')
@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(
    private readonly mcpOrchestrator: McpOrchestratorService,
    private readonly chatHistory: ChatHistoryService
  ) {}

  // Query endpoint - returns MCP format by default, legacy format with ?format=legacy
  @Post(':sessionId/query')
  @ApiOperation({
    summary: 'Process user query',
    description: 'Process a user query using MCP (Model Context Protocol). Returns MCP format by default. Use ?format=legacy for backward compatibility with intent-based format.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Unique session identifier for maintaining conversation history',
    example: 'user123',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['mcp', 'legacy'],
    description: 'Response format. Default: "mcp". Use "legacy" for intent-based format.',
  })
  @ApiBody({
    type: QueryDto,
    description: 'Query request',
    examples: {
      simpleQuery: {
        summary: 'Simple query',
        value: { query: 'Show me all users' },
      },
      detailQuery: {
        summary: 'Detailed query',
        value: { query: 'Show me details for user 5' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully processed query (MCP format)',
    type: McpResponseDto,
  })
  async handleQuery(
    @Param('sessionId') sessionId: string,
    @Body() body: QueryDto,
    @QueryParam('format') format?: 'mcp' | 'legacy'
  ): Promise<ResponseDto | McpResponseDto> {
    try {
      this.logger.log(`[MCP] Processing query for session ${sessionId}: ${body.query}`);
      const result = await this.mcpOrchestrator.processQuery(sessionId, body.query);

      // Return legacy format only if explicitly requested
      if (format === 'legacy') {
        return result;
      }

      // Default to MCP format
      return legacyToMcpResponse(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing MCP query: ${errorMsg}`, error);

      // Return UnknownIntent on error
      const errorResponse: ResponseDto = {
        confidence: 0,
        description: `Error processing query: ${errorMsg}`,
        intent: {
          intentName: 'UnknownIntent',
          component: 'UnknownIntent',
        },
      };

      // Return legacy format only if explicitly requested
      if (format === 'legacy') {
        return errorResponse;
      }

      // Default to MCP format
      return legacyToMcpResponse(errorResponse);
    }
  }

  // New MCP format endpoint
  @Post(':sessionId/execute')
  @ApiOperation({
    summary: 'Execute MCP query (recommended)',
    description: 'Execute a user query using MCP and return response in pure MCP format. This is the recommended endpoint for new integrations.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Unique session identifier for maintaining conversation history',
    example: 'user123',
  })
  @ApiBody({
    type: QueryDto,
    description: 'Query request',
    examples: {
      simpleQuery: {
        summary: 'Simple query',
        value: { query: 'Show me all users' },
      },
      detailQuery: {
        summary: 'Detailed query with data fetching',
        value: { query: 'Show me details for user 5' },
      },
      createQuery: {
        summary: 'Create operation',
        value: { query: 'Create a new user with name John Doe and email john@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully executed query and returned MCP format response',
    type: McpResponseDto,
  })
  async executeMcpQuery(
    @Param('sessionId') sessionId: string,
    @Body() body: QueryDto
  ): Promise<McpResponseDto> {
    try {
      this.logger.log(`[MCP] Executing query for session ${sessionId}: ${body.query}`);
      const result = await this.mcpOrchestrator.processQuery(sessionId, body.query);
      return legacyToMcpResponse(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error executing MCP query: ${errorMsg}`, error);

      return {
        confidence: 0,
        description: `Error processing query: ${errorMsg}`,
        component: 'UnknownIntent',
        parameters: {},
      };
    }
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
    this.logger.log(`Clearing chat history for session ${sessionId}`);
    this.chatHistory.clearChatHistory(sessionId);
  }

  @Get('tools')
  @ApiOperation({
    summary: 'List available MCP tools',
    description: 'Get a list of all available tools from connected MCP servers',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available MCP tools',
    schema: {
      type: 'object',
      properties: {
        tools: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'load_component' },
              description: { type: 'string', example: 'Load a UI component' },
              inputSchema: { type: 'object' },
            },
          },
        },
      },
    },
  })
  async listTools() {
    return {
      tools: await this.mcpOrchestrator.listTools(),
    };
  }

  @Get('resources')
  @ApiOperation({
    summary: 'List available MCP resources',
    description: 'Get a list of all available resources from connected MCP servers',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available MCP resources',
    schema: {
      type: 'object',
      properties: {
        resources: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uri: { type: 'string', example: 'users/list' },
              name: { type: 'string', example: 'Users List' },
              description: { type: 'string', example: 'List of all users' },
              mimeType: { type: 'string', example: 'application/json' },
            },
          },
        },
      },
    },
  })
  async listResources() {
    return {
      resources: await this.mcpOrchestrator.listResources(),
    };
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get MCP system status',
    description: 'Get the current status of the MCP orchestrator and connected servers',
  })
  @ApiResponse({
    status: 200,
    description: 'MCP system status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: { type: 'string', example: 'MCP Orchestrator is running' },
        mode: { type: 'string', example: 'mcp' },
        servers: {
          type: 'object',
          properties: {
            connected: { type: 'number', example: 2 },
            tools: { type: 'number', example: 8 },
            resources: { type: 'number', example: 4 },
          },
        },
      },
    },
  })
  async getStatus() {
    const tools = await this.mcpOrchestrator.listTools();
    const resources = await this.mcpOrchestrator.listResources();

    return {
      status: 'ok',
      message: 'MCP Orchestrator is running',
      mode: 'mcp',
      servers: {
        connected: 2,
        tools: tools.length,
        resources: resources.length,
      },
    };
  }
}
