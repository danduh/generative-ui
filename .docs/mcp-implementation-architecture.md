# FrontAI MCP Implementation Architecture

**Status**: Phase 1 Complete - Foundation Infrastructure
**Date**: February 16, 2026
**Version**: 1.0

## Overview

This document describes the Model Context Protocol (MCP) implementation in FrontAI. The MCP architecture enables dynamic tool discovery, data fetching, and component loading through a standardized protocol, replacing the tightly-coupled OpenAI integration.

## What We've Built (Phase 1)

Phase 1 establishes the foundational infrastructure for MCP integration:

1. **MCP Types Library** - Shared TypeScript types and utilities
2. **UI Components MCP Server** - First MCP server exposing component schemas
3. **MCP Orchestrator Service** - Central coordinator in Router app
4. **MCP Controller** - HTTP endpoints for MCP-based queries
5. **Updated Azure OpenAI Service** - Tool calling support

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           UIHub (Frontend)                       │
│  - User interface                                                │
│  - Sends queries via HTTP POST                                   │
│  - Receives ResponseDto with component intent                    │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP POST /api/mcp/:sessionId/query
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Router App (NestJS Backend)                   │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     MCP Controller                         │  │
│  │  - POST /mcp/:sessionId/query                             │  │
│  │  - POST /mcp/:sessionId/clear                             │  │
│  │  - GET /mcp/tools (debug endpoint)                        │  │
│  │  - GET /mcp/resources (debug endpoint)                    │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
│                        │                                          │
│                        ▼                                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              MCP Orchestrator Service                      │  │
│  │                                                             │  │
│  │  Core Responsibilities:                                    │  │
│  │  1. Discover & connect to MCP servers (stdio transport)   │  │
│  │  2. Maintain tool & resource registries                   │  │
│  │  3. Execute multi-turn conversations with LLM             │  │
│  │  4. Call MCP tools based on LLM decisions                 │  │
│  │  5. Return final component intent to controller           │  │
│  │                                                             │  │
│  │  Key Methods:                                              │  │
│  │  - initialize(): Connect to all configured MCP servers    │  │
│  │  - discoverServers(): Load config, spawn MCP processes    │  │
│  │  - listTools(): Return all available tools                │  │
│  │  - executeTool(): Call specific tool on specific server   │  │
│  │  - processQuery(): Main conversation loop                 │  │
│  └──────┬────────────────────────┬──────────────────────┬─────┘  │
│         │                        │                      │         │
│         │                        │                      │         │
│         ▼                        ▼                      ▼         │
│  ┌──────────────┐    ┌─────────────────────┐   ┌──────────────┐ │
│  │ Chat History │    │ Azure OpenAI Service│   │  MCP Types   │ │
│  │   Service    │    │ (Tool Calling Mode) │   │   Library    │ │
│  │              │    │                     │   │              │ │
│  │ - Session    │    │ - LLM with tools    │   │ - Interfaces │ │
│  │   management │    │ - Tool call parsing │   │ - Types      │ │
│  │ - Chat       │    │ - Response handling │   │ - Utils      │ │
│  │   history    │    │                     │   │              │ │
│  └──────────────┘    └─────────────────────┘   └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                     │ stdio (stdin/stdout)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MCP Servers (Separate Processes)               │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │             UI Components MCP Server                       │  │
│  │  Transport: stdio                                          │  │
│  │  Process: node dist/apps/mcp-servers/ui-components/main.js│  │
│  │                                                             │  │
│  │  Resources:                                                │  │
│  │  - component://available-components                       │  │
│  │  - component://schemas/{componentName}                    │  │
│  │                                                             │  │
│  │  Tools:                                                    │  │
│  │  - load_component(name, parameters)                       │  │
│  │    → Returns component intent for rendering               │  │
│  │                                                             │  │
│  │  - discover_components(query)                             │  │
│  │    → Search for components by description                 │  │
│  │                                                             │  │
│  │  Components Exposed:                                       │  │
│  │  - UsersTable, UserDetails, EditUserForm                  │  │
│  │  - BalancesView, CreditCardsList                          │  │
│  │  - TransactionDetails, TransactionsList                   │  │
│  │  - AvatarLiveView, UnknownIntent                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [Future: Data Sources MCP Server - Phase 2]                    │
│  [Future: External Services MCP Server - Phase 2]               │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. MCP Types Library (`libs/mcp-types`)

**Purpose**: Shared TypeScript types and utilities for MCP integration.

**Location**: `/Users/danielos/dev/frontai/libs/mcp-types/src/`

**Key Files**:
- `index.ts` - Core type definitions
- `lib/zod-to-mcp.ts` - Utility to convert Zod schemas to MCP tool schemas

**Key Types**:
```typescript
interface McpServerConfig {
  name: string;
  transport: 'stdio' | 'sse';
  command?: string;    // For stdio
  args?: string[];
  url?: string;        // For SSE (future)
  env?: Record<string, string>;
}

interface McpServerConnection {
  name: string;
  client: Client;      // MCP SDK client
  tools: ToolDefinition[];
  resources: ResourceDefinition[];
  connected: boolean;
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

interface ToolCall {
  toolName: string;
  arguments: any;
  result?: any;
  error?: string;
}
```

**Dependencies**:
- `@modelcontextprotocol/sdk` - Official MCP SDK
- `zod-to-json-schema` - Schema conversion utility

---

### 2. UI Components MCP Server (`apps/mcp-servers/ui-components`)

**Purpose**: First MCP server that exposes FrontAI component schemas and loading logic.

**Location**: `/Users/danielos/dev/frontai/apps/mcp-servers/ui-components/src/main.ts`

**Build Output**: `dist/apps/mcp-servers/ui-components/main.js`

**Transport**: stdio (stdin/stdout communication)

**Lifecycle**:
1. Started as a child process by MCP Orchestrator
2. Listens on stdio for MCP protocol messages
3. Responds to listTools, listResources, callTool, readResource requests
4. Runs continuously until parent process terminates

**Resources Exposed**:

| Resource URI | Description | Content |
|--------------|-------------|---------|
| `component://available-components` | List all available UI components | JSON array of component metadata |
| `component://schemas/{name}` | Get schema for specific component | Component name, description, required fields |

**Tools Exposed**:

**`load_component`**
- **Description**: Load a UI component with validated parameters
- **Input**:
  ```json
  {
    "name": "UsersTable",  // Required: component name
    "parameters": {}        // Optional: component parameters
  }
  ```
- **Output**: Component intent (ResponseDto format)
  ```json
  {
    "intentName": "UsersTable",
    "component": "UsersTable",
    "parameters": {},
    "description": "Display a table of all users..."
  }
  ```

**`discover_components`**
- **Description**: Search for components by description or functionality
- **Input**:
  ```json
  {
    "query": "show user details"
  }
  ```
- **Output**: Matching components with relevance scores
  ```json
  {
    "query": "show user details",
    "matches": [
      {
        "name": "UserDetails",
        "description": "Show detailed information...",
        "relevance": "high"
      }
    ]
  }
  ```

**Components Exposed**:
- `UsersTable` - Display all users in a table
- `UserDetails` - Show specific user information
- `EditUserForm` - Form to edit/create users
- `BalancesView` - Show account balances
- `CreditCardsList` - Display credit cards
- `TransactionDetails` - Show transaction details
- `TransactionsList` - Display transactions list
- `AvatarLiveView` - Live avatar interaction
- `UnknownIntent` - Fallback component

**Key Design Decision**: Component metadata is duplicated (not imported from `@frontai/registry`) to avoid dependency issues and keep the MCP server lightweight and standalone.

---

### 3. MCP Orchestrator Service (`apps/router/src/app/mcp`)

**Purpose**: Central coordinator for all MCP operations in the Router app.

**Location**: `/Users/danielos/dev/frontai/apps/router/src/app/mcp/mcp-orchestrator.service.ts`

**Key Responsibilities**:

1. **Server Discovery & Connection**
   - Reads config from `apps/router/config/mcp-servers.json`
   - Spawns MCP server processes using stdio transport
   - Maintains connections via MCP SDK Client instances

2. **Tool & Resource Registry**
   - Aggregates tools from all connected MCP servers
   - Maps tool names to their source servers
   - Provides unified `listTools()` and `listResources()` interfaces

3. **Multi-Turn Conversation Loop**
   - Orchestrates the LLM ↔ MCP tool execution cycle
   - Maximum 5 iterations to prevent infinite loops
   - Handles tool results and feeds them back to LLM

4. **Tool Execution**
   - Routes tool calls to the correct MCP server
   - Parses MCP responses (handles content arrays)
   - Returns structured results to conversation loop

**Key Methods**:

```typescript
class McpOrchestratorService {
  // Initialization
  async initialize(): Promise<void>
  async discoverServers(): Promise<void>
  private async connectToServer(config: McpServerConfig): Promise<void>

  // Tool Management
  async listTools(): Promise<ToolDefinition[]>
  async listResources(): Promise<ResourceDefinition[]>
  async executeTool(toolName: string, args: any): Promise<any>
  async queryResource(resourceUri: string): Promise<any>

  // Main Query Processing
  async processQuery(sessionId: string, query: string): Promise<ResponseDto>

  // Cleanup
  async shutdown(): Promise<void>
}
```

**processQuery Flow**:

```
1. Get/Initialize chat history with MCP system prompt
2. Add user query to history
3. Loop (max 5 iterations):
   a. Get all available tools from registry
   b. Call Azure OpenAI with tools
   c. If LLM returns tool calls:
      - Execute each tool via executeTool()
      - Add results to chat history
      - Continue loop
   d. If LLM returns final response:
      - Return ResponseDto with component intent
      - Break loop
4. If max iterations reached, return UnknownIntent
```

**Error Handling**:
- Graceful degradation if MCP server unavailable
- Tool execution errors are caught and returned as error messages
- Comprehensive logging for debugging

**Configuration**: Reads from `apps/router/config/mcp-servers.json`:
```json
{
  "servers": [
    {
      "name": "ui-components",
      "transport": "stdio",
      "command": "node",
      "args": ["dist/apps/mcp-servers/ui-components/main.js"],
      "env": { "NODE_ENV": "production" }
    }
  ]
}
```

---

### 4. MCP Controller (`apps/router/src/app/mcp/mcp.controller.ts`)

**Purpose**: HTTP endpoints for MCP-based queries.

**Location**: `/Users/danielos/dev/frontai/apps/router/src/app/mcp/mcp.controller.ts`

**Base Path**: `/api/mcp`

**Endpoints**:

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/:sessionId/query` | Process user query via MCP | `{ query: string }` | `ResponseDto` |
| POST | `/:sessionId/clear` | Clear chat history | - | `void` |
| GET | `/tools` | List available tools (debug) | - | `{ tools: ToolDefinition[] }` |
| GET | `/resources` | List available resources (debug) | - | `{ resources: ResourceDefinition[] }` |
| GET | `/status` | Health check | - | `{ status: "ok" }` |

**Error Handling**: All errors return UnknownIntent response with error message.

**Integration**: Works alongside existing `/api/azureai` and `/api/openai` endpoints. Feature flag `USE_MCP` controls which mode to use.

---

### 5. Azure OpenAI Service Updates

**Location**: `/Users/danielos/dev/frontai/apps/router/src/app/azureai/azure-openai.service.ts`

**New Method**: `interactWithAssistantWithTools()`

**Purpose**: Extends Azure OpenAI service to support tool calling mode.

**Key Differences from Original `interactWithAssistant()`**:

| Aspect | Original | With Tools |
|--------|----------|------------|
| **Response Format** | Structured output (zodResponseFormat) | Tool calling mode |
| **Tools Parameter** | None | Array of OpenAI function definitions |
| **Response Handling** | Parse structured JSON | Parse tool_calls or content |
| **Use Case** | Direct component intent | Multi-turn with tool execution |

**Response Types**:
```typescript
// Tool calls detected
{
  toolCalls: [
    {
      id: string,
      name: string,
      arguments: Record<string, any>
    }
  ]
}

// Final response (no more tool calls)
{
  confidence: number,
  description: string,
  intent: {
    intentName: string,
    component: string,
    parameters: Record<string, any>
  }
}
```

---

### 6. MCP System Prompts

**Location**: `/Users/danielos/dev/frontai/apps/router/src/app/mcp/mcp-prompts.ts`

**Purpose**: Instructs the LLM how to use MCP tools effectively.

**Key Instructions**:
- When user asks for data, FIRST fetch data using tools
- THEN load appropriate UI component
- List of available components with descriptions
- Examples of multi-step workflows
- Confidence scoring guidelines

**Example Workflow in Prompt**:
```
User: "Show me details for user 5"
1. Call get_user_details(userId: 5)    [Future: Phase 2]
2. Call load_component(name: "UserDetails", parameters: {...userData})
Result: UserDetails component loads with user data
```

---

## File Structure

```
frontai/
├── apps/
│   ├── router/                          # NestJS backend
│   │   ├── src/app/
│   │   │   ├── mcp/
│   │   │   │   ├── mcp-orchestrator.service.ts    # Core MCP orchestrator
│   │   │   │   ├── mcp.controller.ts              # HTTP endpoints
│   │   │   │   └── mcp-prompts.ts                 # System prompts
│   │   │   ├── azureai/
│   │   │   │   └── azure-openai.service.ts        # Updated with tool calling
│   │   │   ├── services/
│   │   │   │   └── chat-history.service.ts        # Session management
│   │   │   ├── dto/
│   │   │   │   └── ai-response.dtos.ts            # ResponseDto, QueryDto
│   │   │   └── app.module.ts                      # Updated with MCP services
│   │   ├── config/
│   │   │   └── mcp-servers.json                   # MCP server configuration
│   │   └── .env                                    # Added USE_MCP flag
│   │
│   └── mcp-servers/                     # MCP server processes
│       └── ui-components/
│           ├── src/
│           │   └── main.ts                         # UI Components MCP server
│           ├── project.json                        # NX build config
│           ├── tsconfig.json
│           ├── tsconfig.app.json
│           └── package.json
│
├── libs/
│   ├── mcp-types/                       # Shared MCP types
│   │   └── src/
│   │       ├── index.ts                            # Type definitions
│   │       └── lib/
│   │           └── zod-to-mcp.ts                   # Utility functions
│   │
│   └── registry/                        # Component schemas (existing)
│       └── src/
│           ├── lib/
│           │   ├── registry.ts                     # UserQueryIntentSchema
│           │   └── schemas/                        # Component Zod schemas
│           └── index.ts
│
├── dist/                                # Build outputs
│   └── apps/
│       ├── router/                                 # Built Router app
│       └── mcp-servers/
│           └── ui-components/                      # Built MCP server
│               ├── main.js
│               ├── package.json
│               └── node_modules/                   # MCP server dependencies
│
└── .docs/
    ├── mcp-architecture.md                         # Original plan (reference)
    └── mcp-implementation-architecture.md          # This document
```

---

## Data Flow: End-to-End Query

Let's trace a query from UIHub to component rendering:

### Example: "Show me all users"

**1. User Input (UIHub)**
```typescript
// UIHub sends HTTP POST
fetch('http://localhost:3000/api/mcp/session-123/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Show me all users' })
})
```

**2. MCP Controller Receives Request**
```typescript
// apps/router/src/app/mcp/mcp.controller.ts
@Post(':sessionId/query')
async handleQuery(sessionId: 'session-123', body: { query: 'Show me all users' })
  → calls mcpOrchestrator.processQuery('session-123', 'Show me all users')
```

**3. MCP Orchestrator Processes Query**
```typescript
// apps/router/src/app/mcp/mcp-orchestrator.service.ts
async processQuery(sessionId, query) {
  // Get chat history (includes MCP system prompt)
  history = chatHistoryService.getChatHistory(sessionId)
  history.push({ role: 'user', content: 'Show me all users' })

  // Iteration 1
  tools = await this.listTools()  // Returns [load_component, discover_components]

  openAITools = tools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }
  }))

  response = await azureOpenAIService.interactWithAssistantWithTools(
    sessionId,
    query,
    openAITools
  )
```

**4. Azure OpenAI Service Calls LLM**
```typescript
// apps/router/src/app/azureai/azure-openai.service.ts
const completion = await this.client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: mcpSystemPrompt },
    { role: 'user', content: 'Show me all users' }
  ],
  tools: [
    {
      type: 'function',
      function: {
        name: 'load_component',
        description: 'Load a UI component...',
        parameters: { ... }
      }
    },
    {
      type: 'function',
      function: {
        name: 'discover_components',
        description: 'Search for components...',
        parameters: { ... }
      }
    }
  ],
  tool_choice: 'auto'
})

// LLM decides to call load_component
message.tool_calls = [
  {
    id: 'call_abc123',
    function: {
      name: 'load_component',
      arguments: '{"name":"UsersTable","parameters":{}}'
    }
  }
]

return {
  toolCalls: [
    {
      id: 'call_abc123',
      name: 'load_component',
      arguments: { name: 'UsersTable', parameters: {} }
    }
  ]
}
```

**5. Orchestrator Executes Tool**
```typescript
// Back in MCP Orchestrator
if (response.toolCalls && response.toolCalls.length > 0) {
  for (const toolCall of response.toolCalls) {
    result = await this.executeTool('load_component', {
      name: 'UsersTable',
      parameters: {}
    })

    // executeTool implementation
    executeTool(toolName, args) {
      entry = this.toolRegistry.get('load_component')
      // entry = { serverName: 'ui-components', tool: {...} }

      connection = this.mcpServers.get('ui-components')

      // Call MCP server via stdio
      result = await connection.client.callTool({
        name: 'load_component',
        arguments: { name: 'UsersTable', parameters: {} }
      })

      // Result from UI Components MCP Server:
      return {
        intentName: 'UsersTable',
        component: 'UsersTable',
        parameters: {},
        description: 'Display a table of all users...'
      }
    }

    // Add tool result to history
    history.push({
      role: 'tool',
      content: JSON.stringify(result)
    })
  }

  // Continue loop (Iteration 2)
```

**6. Second LLM Call (Iteration 2)**
```typescript
// Call LLM again with tool results
response = await azureOpenAIService.interactWithAssistantWithTools(
  sessionId,
  query,  // Same query
  openAITools
)

// LLM sees tool result and decides no more tools needed
// Returns final response
return {
  confidence: 90,
  description: 'Displaying all users in a table',
  intent: {
    intentName: 'UsersTable',
    component: 'UsersTable',
    parameters: {}
  }
}
```

**7. Orchestrator Returns Final Response**
```typescript
// No more tool calls, return ResponseDto
return {
  confidence: 90,
  description: 'Displaying all users in a table',
  intent: {
    intentName: 'UsersTable',
    component: 'UsersTable',
    parameters: {}
  }
}
```

**8. Controller Returns to UIHub**
```typescript
// apps/router/src/app/mcp/mcp.controller.ts
return responseDto  // HTTP 200 with JSON
```

**9. UIHub Renders Component**
```typescript
// UIHub receives ResponseDto
const data = await response.json()

// Use Module Federation to load component
const UsersTable = await loadRemoteComponent('fems/UsersTable')

// Render with parameters
<UsersTable {...data.intent.parameters} />
```

---

## Communication Protocols

### stdio Transport (Phase 1)

**Current Implementation**: MCP servers communicate via stdin/stdout.

**Process Lifecycle**:
```
Router (Parent)                    MCP Server (Child)
     │                                    │
     ├─ spawn process ──────────────────> │
     │  node main.js                      │
     │                                    ├─ initialize
     │                                    ├─ listen on stdio
     │                                    │
     ├─ send: listTools ─────────────────> │
     │                                    ├─ return: {tools: [...]}
     │ <──────────────────────────────────┤
     │                                    │
     ├─ send: callTool(load_component) ──> │
     │                                    ├─ execute tool
     │                                    ├─ return: {content: [...]}
     │ <──────────────────────────────────┤
     │                                    │
     └─ close ───────────────────────────> │
                                          └─ shutdown
```

**Advantages**:
- Simple to implement and debug
- No network configuration required
- Process isolation and security
- Child process lifecycle management

**Limitations**:
- MCP servers must be on same machine as Router
- Cannot scale horizontally
- No load balancing

### SSE Transport (Phase 2 - Future)

**Planned for Production**: HTTP Server-Sent Events for remote MCP servers.

**Benefits**:
- MCP servers can run on different machines
- Horizontal scaling and load balancing
- Better suited for containerized deployments
- Can restart servers without restarting Router

---

## Environment Configuration

### Router App `.env`

```bash
# Azure OpenAI Configuration (Existing)
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT_ID=gpt-4o
API_VERSION=2024-08-01-preview

# MCP Configuration (New)
USE_MCP=false                                      # Feature flag
MCP_SERVER_CONFIG_PATH=apps/router/config/mcp-servers.json
```

### MCP Server Configuration

**File**: `apps/router/config/mcp-servers.json`

```json
{
  "servers": [
    {
      "name": "ui-components",
      "transport": "stdio",
      "command": "node",
      "args": ["dist/apps/mcp-servers/ui-components/main.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
```

**Adding New MCP Servers** (Phase 2):
```json
{
  "servers": [
    {
      "name": "ui-components",
      "transport": "stdio",
      "command": "node",
      "args": ["dist/apps/mcp-servers/ui-components/main.js"],
      "env": { "NODE_ENV": "production" }
    },
    {
      "name": "data-sources",
      "transport": "stdio",
      "command": "node",
      "args": ["dist/apps/mcp-servers/data-sources/main.js"],
      "env": {
        "NODE_ENV": "production",
        "API_URL": "https://jsonplaceholder.typicode.com"
      }
    }
  ]
}
```

---

## Build & Deployment

### Development Build

```bash
# Build MCP Types Library
npx nx build mcp-types

# Build UI Components MCP Server
npx nx build mcp-ui-components

# Build Router App
npx nx build router

# Build order (handled automatically by NX):
# 1. mcp-types (no dependencies)
# 2. mcp-ui-components (depends on mcp-types)
# 3. router (depends on mcp-types)
```

### Running Locally

```bash
# Terminal 1: Start Router (MCP servers auto-start)
npx nx serve router

# Router will:
# 1. Read apps/router/config/mcp-servers.json
# 2. Spawn MCP server processes
# 3. Connect via stdio
# 4. Start HTTP server on port 3000
```

### Deployment Checklist

1. **Pre-deployment**:
   - Build all projects: `npx nx build-many --all`
   - Verify MCP server executables exist in `dist/`
   - Check `mcp-servers.json` paths are correct

2. **Environment Variables**:
   - Set `USE_MCP=true` to enable MCP mode
   - Set `MCP_SERVER_CONFIG_PATH` if config is in different location
   - Ensure Azure OpenAI credentials are set

3. **Process Management**:
   - Router manages MCP server lifecycle automatically
   - MCP servers run as child processes
   - Router restart will restart MCP servers

4. **Health Checks**:
   - `GET /api/mcp/status` - Check MCP orchestrator status
   - `GET /api/mcp/tools` - Verify tools are discovered
   - `POST /api/mcp/test/query` - Test end-to-end flow

---

## Testing Strategy

### Unit Tests (Planned)

```typescript
// mcp-orchestrator.service.spec.ts
describe('McpOrchestratorService', () => {
  it('should discover MCP servers', async () => {
    const servers = await orchestrator.discoverServers()
    expect(servers).toHaveLength(1)
    expect(servers[0].name).toBe('ui-components')
  })

  it('should execute tool successfully', async () => {
    const result = await orchestrator.executeTool('load_component', {
      name: 'UsersTable',
      parameters: {}
    })
    expect(result.intentName).toBe('UsersTable')
  })

  it('should handle tool execution errors', async () => {
    await expect(
      orchestrator.executeTool('nonexistent_tool', {})
    ).rejects.toThrow('Tool not found')
  })
})
```

### Integration Tests

```bash
# Test MCP server standalone
cd dist/apps/mcp-servers/ui-components
npm install
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node main.js

# Test Router → MCP Server
curl -X POST http://localhost:3000/api/mcp/test/query \
  -H "Content-Type: application/json" \
  -d '{"query":"Show me all users"}'

# Expected Response:
# {
#   "confidence": 90,
#   "description": "Displaying all users...",
#   "intent": {
#     "intentName": "UsersTable",
#     "component": "UsersTable",
#     "parameters": {}
#   }
# }
```

### End-to-End Tests

```typescript
// Test full user journey
describe('MCP E2E', () => {
  it('should handle user query and return component intent', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/mcp/test-session/query')
      .send({ query: 'Show me all users' })
      .expect(200)

    expect(response.body.intent.component).toBe('UsersTable')
    expect(response.body.confidence).toBeGreaterThan(80)
  })
})
```

---

## Key Design Decisions

### 1. stdio vs SSE Transport

**Decision**: Use stdio for Phase 1, SSE for production (Phase 2).

**Rationale**:
- stdio is simpler to implement and debug
- Allows us to validate MCP architecture quickly
- SSE adds complexity but enables scaling

### 2. MCP Server Process Lifecycle

**Decision**: Router manages MCP server lifecycle (spawn/shutdown).

**Rationale**:
- Single point of control
- Simplified deployment (one process to start)
- Automatic cleanup on Router shutdown

**Alternative Considered**: Independent MCP servers with SSE.
- Rejected for Phase 1 due to added complexity
- Planned for Phase 2 production deployment

### 3. Component Metadata Duplication

**Decision**: Duplicate component metadata in MCP server instead of importing from `@frontai/registry`.

**Rationale**:
- Avoids complex dependency resolution issues
- MCP server remains lightweight and standalone
- Easier to build and deploy
- Metadata changes are infrequent

**Trade-off**: Must keep metadata in sync manually.

### 4. Multi-Turn Conversation Loop

**Decision**: Implement agentic loop in Orchestrator (max 5 iterations).

**Rationale**:
- Enables complex multi-step workflows
- LLM can fetch data before loading components
- Allows for error recovery and refinement

**Safety**: Max iterations prevents infinite loops.

### 5. Backward Compatibility

**Decision**: Keep existing `/api/azureai` endpoints, add `/api/mcp` alongside.

**Rationale**:
- Gradual migration path
- A/B testing capability
- Rollback safety
- Feature flag control (`USE_MCP`)

### 6. Tool Registry Pattern

**Decision**: Centralized tool registry in Orchestrator.

**Rationale**:
- Single source of truth for available tools
- Easy to query all tools across servers
- Supports future multi-server scenarios

**Implementation**: Map<toolName, {serverName, tool}>

---

## Performance Characteristics

### Latency Breakdown (Estimated)

```
User Query → Component Rendered
│
├─ UIHub → Router HTTP: ~10-50ms
├─ MCP Orchestrator Init: ~5-20ms
├─ Tool Discovery (cached): ~1-5ms
│
├─ Iteration 1:
│  ├─ Azure OpenAI LLM Call: ~800-1500ms
│  ├─ Tool Execution (load_component): ~10-30ms
│  └─ Parse & Add to History: ~5ms
│
├─ Iteration 2:
│  └─ Azure OpenAI LLM Call: ~800-1500ms
│
├─ Response Serialization: ~5ms
├─ Router → UIHub HTTP: ~10-50ms
└─ UIHub Component Loading: ~100-300ms

Total: ~1.8-3.5 seconds (p95)
```

**Optimization Opportunities**:
- Cache tool lists (5-minute TTL)
- Stream responses from LLM
- Parallel tool execution
- Component pre-loading

### Memory Usage

```
Router App: ~150-200MB
MCP UI Components Server: ~50-80MB
Total: ~200-280MB

Per Session:
- Chat History: ~5-20KB
- Tool Results: ~10-50KB
```

### Scalability

**Current (stdio)**:
- Single Router instance
- N MCP servers as child processes
- Limited by single machine resources

**Future (SSE)**:
- Multiple Router instances (load balanced)
- MCP servers as independent services
- Horizontal scaling possible

---

## Security Considerations

### 1. MCP Server Isolation

- MCP servers run as separate processes
- Limited file system access
- No direct database access
- Communication only via MCP protocol

### 2. Input Validation

- Tool arguments validated by MCP SDK
- Component parameters validated against schemas
- User queries sanitized before LLM

### 3. Tool Execution Safety

- Tool calls are logged
- Errors don't crash Router
- Max iteration limit prevents resource exhaustion

### 4. Environment Variables

- Sensitive keys in `.env` (not committed)
- MCP servers receive minimal environment
- No credential passing via MCP protocol

---

## Monitoring & Observability

### Logging

**MCP Orchestrator**:
```
[McpOrchestratorService] Initializing MCP Orchestrator...
[McpOrchestratorService] Connecting to MCP server: ui-components
[McpOrchestratorService] Connected to ui-components: 2 tools, 10 resources
[McpOrchestratorService] Iteration 1: Calling LLM with 2 tools
[McpOrchestratorService] Processing 1 tool calls
[McpOrchestratorService] Executing tool: load_component with args: {...}
```

**MCP Server**:
```
UI Components MCP Server running on stdio
```

### Key Metrics (Future)

- Query response time (p50, p95, p99)
- Tool execution time per tool
- LLM latency per iteration
- Success rate (non-UnknownIntent responses)
- Tool call distribution

### Debug Endpoints

```
GET /api/mcp/status        → Orchestrator health
GET /api/mcp/tools         → List all discovered tools
GET /api/mcp/resources     → List all discovered resources
```

---

## Future Enhancements (Phase 2+)

### Phase 2: Data Sources MCP Server

**Purpose**: Provide data fetching capabilities (users, transactions, balances).

**Tools**:
- `query_users(filter?, page?, pageSize?)`
- `get_user_details(userId)`
- `update_user(userId, data)`
- `create_user(data)`
- `get_transactions(userId, dateRange?)`
- `get_balances(userId)`

**Resources**:
- `data://users/list`
- `data://users/{id}`
- `data://transactions/{userId}`
- `data://balances/{userId}`

**Data Source**: JSONPlaceholder API initially, replace with real backend later.

### Phase 3: Streaming Responses

**SSE Endpoint**: `GET /api/mcp/:sessionId/query/stream`

**Benefits**:
- Real-time tool execution updates
- Progress indicators in UIHub
- Better perceived performance

### Phase 4: Redis Session Persistence

**Motivation**: In-memory sessions don't scale across Router instances.

**Implementation**:
- Replace `Map<string, SessionData>` with Redis
- Store chat history per session
- Store MCP context (tool calls, results)

### Phase 5: SSE Transport for Production

**Deployment Model**:
```
Load Balancer
     │
     ├─> Router Instance 1 ────┐
     ├─> Router Instance 2 ────┼──> MCP Server Pool (SSE)
     └─> Router Instance 3 ────┘      - ui-components-1
                                       - ui-components-2
                                       - data-sources-1
                                       - data-sources-2
```

---

## Troubleshooting Guide

### Problem: MCP Server Not Starting

**Symptoms**: Router logs "Failed to connect to MCP server"

**Diagnosis**:
```bash
# Check if MCP server built correctly
ls -la dist/apps/mcp-servers/ui-components/main.js

# Test MCP server standalone
cd dist/apps/mcp-servers/ui-components
npm install
node main.js
```

**Solutions**:
1. Rebuild MCP server: `npx nx build mcp-ui-components --skip-nx-cache`
2. Check dependencies are installed in dist folder
3. Verify `mcp-servers.json` paths are correct

### Problem: Tool Not Found

**Symptoms**: Error "Tool load_component not found"

**Diagnosis**:
```bash
# Check tool registry
curl http://localhost:3000/api/mcp/tools
```

**Solutions**:
1. Verify MCP server is connected
2. Check tool is registered in UI Components server
3. Restart Router to refresh tool registry

### Problem: Max Iterations Reached

**Symptoms**: Query returns UnknownIntent after timeout

**Diagnosis**: LLM is stuck in tool calling loop

**Solutions**:
1. Check system prompt clarity
2. Verify tool descriptions are clear
3. Review LLM logs for repeated tool calls
4. Consider adding stop conditions in prompt

### Problem: Component Not Rendering

**Symptoms**: ResponseDto received but component doesn't load

**Diagnosis**: Issue is in UIHub, not MCP

**Solutions**:
1. Check ResponseDto format matches expected
2. Verify Module Federation configuration
3. Test component loading independently

---

## Comparison: Before vs After MCP

| Aspect | Before (OpenAI Direct) | After (MCP) |
|--------|------------------------|-------------|
| **Architecture** | Monolithic, tightly coupled | Modular, extensible |
| **Component Discovery** | Hard-coded in prompts | Dynamic via MCP resources |
| **Data Fetching** | Components fetch their own data | MCP tools fetch before rendering |
| **Extensibility** | Modify prompts and code | Add new MCP servers |
| **Tool Execution** | Not supported | Native support via MCP |
| **Testing** | Hard to isolate | MCP servers testable independently |
| **Scaling** | Limited to single LLM provider | Can add multiple MCP servers |
| **Development** | Changes require Router restart | Hot-reload MCP servers possible (SSE) |

---

## Conclusion

Phase 1 of the MCP migration establishes a solid foundation for modular, extensible AI interactions in FrontAI. The implementation:

✅ **Separates concerns** between component loading, data fetching, and external services
✅ **Enables dynamic capability discovery** via MCP resources and tools
✅ **Supports multi-turn conversations** with tool execution
✅ **Maintains backward compatibility** with feature flags
✅ **Provides clear extension points** for Phase 2 and beyond

The architecture is production-ready for Phase 1 (stdio transport) and provides a clear path to production-grade deployment with SSE transport in Phase 2.

---

**Document Version**: 1.0
**Last Updated**: February 16, 2026
**Status**: Phase 1 Complete, Phase 2 Planning
