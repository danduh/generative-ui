import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export interface McpServerConfig {
  name: string;
  transport: 'stdio' | 'sse';
  command?: string; // For stdio: node path/to/server.js
  args?: string[];
  url?: string; // For sse: http://localhost:3001
  env?: Record<string, string>;
}

export interface McpServerConnection {
  name: string;
  client: Client;
  tools: ToolDefinition[];
  resources: ResourceDefinition[];
  connected: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

export interface ResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ToolCall {
  toolName: string;
  arguments: any;
  result?: any;
  error?: string;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}

// Re-export utility functions
export * from './lib/zod-to-mcp';
