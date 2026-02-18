import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import {
  McpServerConfig,
  McpServerConnection,
  ToolDefinition,
  ResourceDefinition,
  ToolCall,
} from '@frontai/mcp-types';
import { ChatHistoryService } from '../services/chat-history.service';
import { AzureOpenAIService } from '../azureai/azure-openai.service';
import { ResponseDto } from '../dto/ai-response.dtos';
import { mcpSystemPrompt } from './mcp-prompts';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class McpOrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(McpOrchestratorService.name);
  private mcpServers: Map<string, McpServerConnection> = new Map();
  private toolRegistry: Map<string, { serverName: string; tool: ToolDefinition }> = new Map();
  private resourceRegistry: Map<string, { serverName: string; resource: ResourceDefinition }> = new Map();
  private initialized = false;

  constructor(
    private configService: ConfigService,
    private chatHistoryService: ChatHistoryService,
    private azureOpenAIService: AzureOpenAIService
  ) {}

  async onModuleInit() {
    try {
      await this.initialize();
    } catch (error) {
      this.logger.error('Failed to initialize MCP Orchestrator', error);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.logger.log('Initializing MCP Orchestrator...');

    try {
      await this.discoverServers();
      this.initialized = true;
      this.logger.log('MCP Orchestrator initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MCP Orchestrator', error);
      throw error;
    }
  }

  async discoverServers(): Promise<void> {
    const configPath = this.configService.get<string>('MCP_SERVER_CONFIG_PATH') ||
                       path.join(process.cwd(), 'apps/router/config/mcp-servers.json');

    if (!fs.existsSync(configPath)) {
      this.logger.warn(`MCP server config not found at ${configPath}, skipping MCP initialization`);
      return;
    }

    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    for (const serverConfig of config.servers as McpServerConfig[]) {
      try {
        await this.connectToServer(serverConfig);
      } catch (error) {
        this.logger.error(`Failed to connect to MCP server ${serverConfig.name}`, error);
      }
    }
  }

  private async connectToServer(config: McpServerConfig): Promise<void> {
    this.logger.log(`Connecting to MCP server: ${config.name}`);

    if (config.transport !== 'stdio') {
      throw new Error('Only stdio transport is currently supported');
    }

    const client = new Client(
      {
        name: 'frontai-router',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    const transport = new StdioClientTransport({
      command: config.command!,
      args: config.args || [],
      env: config.env || {},
    });

    await client.connect(transport);

    // Discover tools
    const toolsResult = await client.listTools();
    const tools: ToolDefinition[] = toolsResult.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || '',
      inputSchema: tool.inputSchema as any,
    }));

    // Discover resources
    const resourcesResult = await client.listResources();
    const resources: ResourceDefinition[] = resourcesResult.resources.map((resource) => ({
      uri: resource.uri,
      name: resource.name,
      description: resource.description,
      mimeType: resource.mimeType,
    }));

    const connection: McpServerConnection = {
      name: config.name,
      client,
      tools,
      resources,
      connected: true,
    };

    this.mcpServers.set(config.name, connection);

    // Register tools in global registry
    for (const tool of tools) {
      this.toolRegistry.set(tool.name, { serverName: config.name, tool });
    }

    // Register resources in global registry
    for (const resource of resources) {
      this.resourceRegistry.set(resource.uri, { serverName: config.name, resource });
    }

    this.logger.log(
      `Connected to ${config.name}: ${tools.length} tools, ${resources.length} resources`
    );
  }

  async listTools(): Promise<ToolDefinition[]> {
    return Array.from(this.toolRegistry.values()).map((entry) => entry.tool);
  }

  async listResources(): Promise<ResourceDefinition[]> {
    return Array.from(this.resourceRegistry.values()).map((entry) => entry.resource);
  }

  async executeTool(toolName: string, args: any): Promise<any> {
    const entry = this.toolRegistry.get(toolName);
    if (!entry) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const connection = this.mcpServers.get(entry.serverName);
    if (!connection || !connection.connected) {
      throw new Error(`Server ${entry.serverName} not connected`);
    }

    this.logger.log(`Executing tool: ${toolName} with args: ${JSON.stringify(args)}`);

    try {
      const result = await connection.client.callTool({
        name: toolName,
        arguments: args,
      });

      // Parse the result - MCP returns content array
      if (result.content && Array.isArray(result.content) && result.content.length > 0) {
        const content = result.content[0];
        if (content.type === 'text' && 'text' in content) {
          return JSON.parse(content.text);
        }
        return content;
      }

      return result;
    } catch (error) {
      this.logger.error(`Tool execution failed for ${toolName}`, error);
      throw error;
    }
  }

  async queryResource(resourceUri: string): Promise<any> {
    const entry = this.resourceRegistry.get(resourceUri);
    if (!entry) {
      throw new Error(`Resource ${resourceUri} not found`);
    }

    const connection = this.mcpServers.get(entry.serverName);
    if (!connection || !connection.connected) {
      throw new Error(`Server ${entry.serverName} not connected`);
    }

    const result = await connection.client.readResource({
      uri: resourceUri,
    });

    if (result.contents && result.contents.length > 0) {
      const content = result.contents[0];
      if ('text' in content && content.text) {
        return JSON.parse(content.text);
      }
      return content;
    }

    return result;
  }

  async processQuery(sessionId: string, query: string): Promise<ResponseDto> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Get chat history and add system prompt if needed
    const history = this.chatHistoryService.getChatHistory(sessionId);

    // Replace system message with MCP-specific prompt
    if (history.length > 0 && history[0].role === 'system') {
      history[0].content = mcpSystemPrompt;
    }

    // Add user query to history
    history.push({ role: 'user', content: query });

    const maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      // Get available tools
      const tools = await this.listTools();

      // Convert tools to OpenAI format
      const openAITools = tools.map((tool) => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      }));

      this.logger.log(`Iteration ${iteration}: Calling LLM with ${tools.length} tools`);

      // Call Azure OpenAI with tools
      const response = await this.azureOpenAIService.interactWithAssistantWithTools(
        sessionId,
        query,
        openAITools
      );

      // Check if we have tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        this.logger.log(`Processing ${response.toolCalls.length} tool calls`);

        // Execute all tool calls
        const toolResults: ToolCall[] = [];
        for (const toolCall of response.toolCalls) {
          try {
            this.logger.log(`Executing tool: ${toolCall.name} with args: ${JSON.stringify(toolCall.arguments)}`);
            const result = await this.executeTool(toolCall.name, toolCall.arguments);
            this.logger.log(`Tool ${toolCall.name} result: ${JSON.stringify(result).substring(0, 200)}...`);

            toolResults.push({
              toolName: toolCall.name,
              arguments: toolCall.arguments,
              result,
            });

            // Add tool result to history with tool_call_id
            history.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            } as any);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Tool ${toolCall.name} failed: ${errorMessage}`);

            toolResults.push({
              toolName: toolCall.name,
              arguments: toolCall.arguments,
              error: errorMessage,
            });

            // Add error to history with tool_call_id
            history.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: errorMessage }),
            } as any);
          }
        }

        // Continue to next iteration to let LLM process tool results
        continue;
      }

      // No more tool calls, return the final response
      if (response.intent) {
        this.logger.log(`Final response: confidence=${response.confidence}, component=${response.intent.component}`);
        this.logger.log(`Response description: ${response.description}`);
        return response;
      }

      // If we get here, something unexpected happened
      this.logger.warn('Unexpected response from LLM, returning UnknownIntent');
      this.logger.warn(`LLM response was: ${JSON.stringify(response)}`);
      return {
        confidence: 0,
        description: 'I could not understand your request',
        intent: {
          intentName: 'UnknownIntent',
          component: 'UnknownIntent',
        },
      };
    }

    // Max iterations reached
    this.logger.error('Max iterations reached in processQuery');
    return {
      confidence: 0,
      description: 'The request was too complex to process',
      intent: {
        intentName: 'UnknownIntent',
        component: 'UnknownIntent',
      },
    };
  }

  async shutdown(): Promise<void> {
    this.logger.log('Shutting down MCP Orchestrator...');

    for (const [name, connection] of this.mcpServers.entries()) {
      try {
        await connection.client.close();
        this.logger.log(`Disconnected from ${name}`);
      } catch (error) {
        this.logger.error(`Error disconnecting from ${name}`, error);
      }
    }

    this.mcpServers.clear();
    this.toolRegistry.clear();
    this.resourceRegistry.clear();
    this.initialized = false;
  }
}
