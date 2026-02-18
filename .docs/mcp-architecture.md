# FrontAI MCP Architecture

## Overview

This document outlines the architecture for migrating FrontAI from a custom OpenAI-based intent recognition system to a **Model Context Protocol (MCP)** based architecture. MCP provides a standardized way to connect AI models with external data sources and tools, enabling more flexible and powerful generative UI capabilities.

## What is MCP?

Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to LLMs. It enables:

- **Resources**: Expose data sources (databases, APIs, files) that LLMs can read
- **Tools**: Define callable functions that LLMs can execute
- **Prompts**: Pre-defined templates for common interactions
- **Sampling**: Allow servers to request LLM completions

## Current Architecture (OpenAI-based)

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   UIHub     │  query   │    Router    │  prompt  │   OpenAI    │
│  (Port 4200)│─────────▶│ (Port 3000)  │─────────▶│     API     │
│             │          │              │          │             │
│  - Chat UI  │          │ - Session    │          │ - Intent    │
│  - Canvas   │◀─────────│   Manager    │◀─────────│   Recognition│
│  - Module   │ response │ - OpenAI     │ response │             │
│    Fed      │          │   Client     │          │             │
└─────────────┘          └──────────────┘          └─────────────┘
                                │
                                │ loads schemas
                                ▼
                         ┌──────────────┐
                         │   Registry   │
                         │              │
                         │ - Zod        │
                         │   Schemas    │
                         │ - Component  │
                         │   Metadata   │
                         └──────────────┘
                                │
                                │ lazy load
                                ▼
                         ┌──────────────┐
                         │     FEMS     │
                         │  (Port 4201) │
                         │              │
                         │ - UsersTable │
                         │ - EditForm   │
                         │ - etc.       │
                         └──────────────┘
```

### Current Flow:
1. User enters query in UIHub
2. Router receives query + session history
3. Router sends to OpenAI with Zod schemas as JSON schema
4. OpenAI returns structured intent: `{intentName, component, parameters}`
5. Router sends intent back to UIHub
6. UIHub lazy-loads component from FEMS
7. Component renders with parameters

### Limitations:
- Tightly coupled to OpenAI API
- Limited to pre-defined component schemas
- Cannot dynamically discover new data sources
- No tool execution capabilities
- Hard to extend with new functionality

## Proposed MCP Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          UIHub (Port 4200)                      │
│                                                                 │
│  ┌──────────────┐                          ┌─────────────────┐ │
│  │  Chat Panel  │                          │  Canvas Panel   │ │
│  │              │                          │                 │ │
│  │ - User Input │                          │ - Dynamic       │ │
│  │ - Message    │                          │   Component     │ │
│  │   History    │                          │   Rendering     │ │
│  └──────────────┘                          └─────────────────┘ │
│         │                                           ▲           │
│         │ query                                     │ component │
│         ▼                                           │           │
└─────────────────────────────────────────────────────────────────┘
          │                                           │
          │ POST /api/mcp/query                       │
          ▼                                           │
┌─────────────────────────────────────────────────────────────────┐
│                      Router (Port 3000)                         │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                    MCP Orchestrator                         ││
│  │                                                             ││
│  │  - Session Manager                                          ││
│  │  - MCP Client (connects to MCP servers)                     ││
│  │  - LLM Integration (OpenAI/Claude/Local)                    ││
│  │  - Tool Execution Engine                                    ││
│  │  - Resource Query Engine                                    ││
│  └────────────────────────────────────────────────────────────┘│
│         │                      │                      │         │
│         │ list tools           │ list resources       │         │
│         ▼                      ▼                      │         │
│  ┌──────────────┐      ┌──────────────┐      ┌──────▼───────┐ │
│  │ Tool Manager │      │   Resource   │      │  Component   │ │
│  │              │      │   Manager    │      │   Registry   │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│         │                      │                      │         │
└─────────┼──────────────────────┼──────────────────────┼─────────┘
          │                      │                      │
          │ MCP protocol         │ MCP protocol         │
          ▼                      ▼                      │
┌──────────────────────────────────────────────┐       │
│         MCP Server Infrastructure            │       │
│                                              │       │
│  ┌─────────────────────────────────────────┐│       │
│  │  UI Components MCP Server               ││       │
│  │                                          ││       │
│  │  Resources:                              ││       │
│  │  - component://available-components      ││       │
│  │  - component://schemas/{componentName}   ││       │
│  │                                          ││       │
│  │  Tools:                                  ││       │
│  │  - load_component(name, parameters)      ││       │
│  │  - discover_components(query)            ││       │
│  └─────────────────────────────────────────┘│       │
│                                              │       │
│  ┌─────────────────────────────────────────┐│       │
│  │  Data Sources MCP Server                ││       │
│  │                                          ││       │
│  │  Resources:                              ││       │
│  │  - data://users/list                     ││       │
│  │  - data://users/{id}                     ││       │
│  │  - data://transactions/{userId}          ││       │
│  │  - data://balances/{userId}              ││       │
│  │                                          ││       │
│  │  Tools:                                  ││       │
│  │  - query_users(filter, page, pageSize)  ││       │
│  │  - get_user_details(userId)              ││       │
│  │  - update_user(userId, data)             ││       │
│  │  - create_user(data)                     ││       │
│  └─────────────────────────────────────────┘│       │
│                                              │       │
│  ┌─────────────────────────────────────────┐│       │
│  │  External Services MCP Server           ││       │
│  │                                          ││       │
│  │  Tools:                                  ││       │
│  │  - search_documentation(query)           ││       │
│  │  - fetch_external_data(endpoint)         ││       │
│  │  - send_notification(userId, message)    ││       │
│  └─────────────────────────────────────────┘│       │
│                                              │       │
│  ┌─────────────────────────────────────────┐│       │
│  │  Analytics MCP Server (Optional)        ││       │
│  │                                          ││       │
│  │  Resources:                              ││       │
│  │  - analytics://user-interactions         ││       │
│  │  - analytics://component-usage           ││       │
│  │                                          ││       │
│  │  Tools:                                  ││       │
│  │  - log_interaction(event)                ││       │
│  │  - get_insights(timeRange)               ││       │
│  └─────────────────────────────────────────┘│       │
└──────────────────────────────────────────────┘       │
                                                       │
                                                       │
┌──────────────────────────────────────────────────────┼─────────┐
│                FEMS Microfrontend (Port 4201)        │         │
│                                                      │         │
│  Components (exposed via Module Federation):        │         │
│  - UsersTable                                        │         │
│  - EditUserForm                                      │         │
│  - UserDetails                                       │         │
│  - BalancesView                                      │         │
│  - TransactionsList                                  │         │
│  - TransactionDetails                                │         │
│  - CreditCardsList                                   │         │
│  - AvatarLiveView                                    │         │
│                                                      │         │
│  Each component:                                     │         │
│  - Receives AIComponentProps                         │         │
│  - Can fetch data via MCP tools                      │         │
│  - Can trigger further instructions                  │         │
└──────────────────────────────────────────────────────┴─────────┘
```

## Key Components

### 1. MCP Orchestrator (Router Backend)

The central intelligence that coordinates MCP servers and LLM interactions.

**Responsibilities:**
- Maintain connections to multiple MCP servers
- Aggregate available resources and tools from all servers
- Send user queries to LLM with MCP context
- Execute tool calls requested by LLM
- Retrieve resource data when needed
- Return structured UI intent to UIHub

**Key Modules:**

```typescript
// apps/router/src/mcp/mcp-orchestrator.service.ts

class McpOrchestratorService {
  private mcpServers: Map<string, McpServerConnection>;
  private toolRegistry: Map<string, ToolDefinition>;
  private resourceRegistry: Map<string, ResourceDefinition>;

  async initialize(): Promise<void>
  async discoverServers(): Promise<void>
  async listTools(): Promise<ToolDefinition[]>
  async listResources(): Promise<ResourceDefinition[]>
  async executeTool(toolName: string, args: any): Promise<any>
  async queryResource(resourceUri: string): Promise<any>
  async processQuery(sessionId: string, query: string): Promise<UIIntent>
}
```

### 2. MCP Server: UI Components

Manages all available UI components and their schemas.

**Resources:**
- `component://available-components` - List of all components
- `component://schemas/{componentName}` - Zod schema for specific component

**Tools:**
- `load_component(name, parameters)` - Returns component intent
- `discover_components(query)` - Search for relevant components
- `validate_parameters(componentName, params)` - Validate component params

**Implementation:**
```typescript
// apps/mcp-servers/ui-components/src/server.ts

const server = new McpServer({
  name: 'ui-components',
  version: '1.0.0',
});

server.resource('component://available-components', async () => {
  return {
    contents: [
      {
        uri: 'component://available-components',
        mimeType: 'application/json',
        text: JSON.stringify(componentRegistry.list()),
      },
    ],
  };
});

server.tool('load_component', {
  description: 'Load a UI component with parameters',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      parameters: { type: 'object' },
    },
    required: ['name'],
  },
}, async (args) => {
  const { name, parameters } = args;
  const component = componentRegistry.get(name);

  if (!component) {
    throw new Error(`Component ${name} not found`);
  }

  // Validate parameters against Zod schema
  const validated = component.schema.parse(parameters);

  return {
    intentName: component.intentName,
    component: component.name,
    parameters: validated,
    description: component.description,
  };
});
```

### 3. MCP Server: Data Sources

Provides access to backend data (users, transactions, balances).

**Resources:**
- `data://users/list` - All users
- `data://users/{id}` - Specific user
- `data://transactions/{userId}` - User transactions
- `data://balances/{userId}` - User balances

**Tools:**
- `query_users(filter?, page?, pageSize?)` - Query users with filters
- `get_user_details(userId)` - Get specific user
- `update_user(userId, data)` - Update user
- `create_user(data)` - Create new user
- `get_transactions(userId, dateRange?)` - Get transactions
- `get_balances(userId)` - Get user balances

**Implementation:**
```typescript
// apps/mcp-servers/data-sources/src/server.ts

server.tool('query_users', {
  description: 'Query users with optional filters',
  inputSchema: {
    type: 'object',
    properties: {
      filter: { type: 'string' },
      page: { type: 'number', default: 1 },
      pageSize: { type: 'number', default: 10 },
    },
  },
}, async (args) => {
  const users = await userService.query(args);
  return {
    users,
    total: users.length,
    page: args.page,
    pageSize: args.pageSize,
  };
});

server.resource('data://users/{id}', async (uri) => {
  const id = extractIdFromUri(uri);
  const user = await userService.findById(id);

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(user),
      },
    ],
  };
});
```

### 4. MCP Server: External Services

Integrates with external APIs and services.

**Tools:**
- `search_documentation(query)` - Search Azure AI Search
- `fetch_external_data(endpoint, params)` - Call external APIs
- `send_notification(userId, message)` - Send notifications
- `generate_report(type, filters)` - Generate reports

### 5. Modified UIHub

Updated to handle MCP-based responses and tool executions.

**Changes:**
- Support for multi-turn conversations (tool execution loops)
- Handle streaming responses from LLM
- Display tool execution status
- Show intermediate results

```typescript
// apps/uihub/src/app/services/mcp-client.tsx

interface McpResponse {
  intent?: UIIntent;
  toolCalls?: ToolCall[];
  needsMoreInfo?: boolean;
  message?: string;
}

class McpClientService {
  async sendQuery(sessionId: string, query: string): Promise<McpResponse> {
    const response = await fetch(`/api/mcp/query`, {
      method: 'POST',
      body: JSON.stringify({ sessionId, query }),
    });

    return response.json();
  }

  async streamQuery(
    sessionId: string,
    query: string,
    onChunk: (chunk: any) => void
  ): Promise<void> {
    const response = await fetch(`/api/mcp/query/stream`, {
      method: 'POST',
      body: JSON.stringify({ sessionId, query }),
    });

    const reader = response.body.getReader();
    // Handle streaming...
  }
}
```

## Data Flow

### Example 1: Simple Component Load

**User Query:** "Show me all users"

```
1. User → UIHub: "Show me all users"

2. UIHub → Router: POST /api/mcp/query
   {
     sessionId: "abc123",
     query: "Show me all users"
   }

3. Router → MCP Orchestrator: processQuery()

4. MCP Orchestrator:
   - Lists available tools from all MCP servers
   - Finds: load_component, query_users, etc.

5. MCP Orchestrator → LLM:
   System: "You have access to these tools..."
   User: "Show me all users"

6. LLM → MCP Orchestrator:
   {
     tool_calls: [
       {
         name: "load_component",
         arguments: {
           name: "UsersTable",
           parameters: {}
         }
       }
     ]
   }

7. MCP Orchestrator → UI Components MCP Server:
   Execute tool: load_component("UsersTable", {})

8. UI Components Server → MCP Orchestrator:
   {
     intentName: "UsersTable",
     component: "UsersTable",
     parameters: {},
     description: "Displaying all users in a table"
   }

9. MCP Orchestrator → Router → UIHub:
   {
     intent: {
       intentName: "UsersTable",
       component: "UsersTable",
       parameters: {}
     },
     message: "Displaying all users in a table"
   }

10. UIHub:
    - Lazy loads: import('fems/UsersTable')
    - Renders component in canvas

11. UsersTable Component:
    - Fetches data from JSONPlaceholder API
    - Displays users in table
```

### Example 2: Component with Data Fetching

**User Query:** "Show me details for user 5"

```
1. User → UIHub: "Show me details for user 5"

2. UIHub → Router: POST /api/mcp/query

3. MCP Orchestrator → LLM with available tools

4. LLM → MCP Orchestrator:
   {
     tool_calls: [
       {
         name: "get_user_details",
         arguments: { userId: 5 }
       }
     ]
   }

5. MCP Orchestrator → Data Sources MCP Server:
   Execute: get_user_details(5)

6. Data Sources Server → External API:
   GET https://jsonplaceholder.typicode.com/users/5

7. Data Sources Server → MCP Orchestrator:
   {
     id: 5,
     name: "Chelsey Dietrich",
     email: "Lucio_Hettinger@annie.ca",
     company: { name: "Keebler LLC" }
   }

8. MCP Orchestrator → LLM:
   Tool result: { user: {...} }

9. LLM → MCP Orchestrator:
   {
     tool_calls: [
       {
         name: "load_component",
         arguments: {
           name: "UserDetails",
           parameters: {
             userId: 5,
             name: "Chelsey Dietrich",
             email: "Lucio_Hettinger@annie.ca",
             company: { name: "Keebler LLC" }
           }
         }
       }
     ]
   }

10. MCP Orchestrator executes load_component

11. Router → UIHub: Intent with UserDetails component + data

12. UIHub renders UserDetails with pre-fetched data
```

### Example 3: Multi-Tool Execution

**User Query:** "Create a new user named John Doe working at Acme Corp"

```
1. User → UIHub: "Create a new user named John Doe working at Acme Corp"

2. LLM decides to create user then show edit form

3. LLM → Tool Calls:
   [
     {
       name: "create_user",
       arguments: {
         name: "John Doe",
         email: "john.doe@acme.com",
         company: { name: "Acme Corp" }
       }
     }
   ]

4. MCP Orchestrator → Data Sources Server:
   Execute: create_user(...)

5. Data Sources Server creates user and returns:
   { id: 11, name: "John Doe", ... }

6. LLM receives result and makes second tool call:
   {
     name: "load_component",
     arguments: {
       name: "EditUserForm",
       parameters: {
         userId: 11,
         name: "John Doe",
         email: "john.doe@acme.com",
         company: { name: "Acme Corp" }
       }
     }
   }

7. UIHub receives intent and renders EditUserForm with new user data
```

## Implementation Plan

### Phase 1: MCP Infrastructure Setup (Week 1-2)

1. **Install MCP Dependencies**
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. **Create MCP Server Framework**
   - Set up NX library for shared MCP types
   - Create base MCP server template
   - Implement server discovery mechanism

3. **Update Router with MCP Client**
   - Install MCP client in Router
   - Create McpOrchestratorService
   - Implement server connection management
   - Add tool/resource discovery

4. **Create UI Components MCP Server**
   - Migrate existing registry to MCP server
   - Implement component:// resources
   - Add load_component tool
   - Test with existing components

### Phase 2: Data Sources MCP Server (Week 3)

1. **Create Data Sources Server**
   - Implement data:// resources
   - Add CRUD tools for users
   - Add query tools with filters
   - Connect to JSONPlaceholder API

2. **Update Components to Use MCP Data**
   - Modify UsersTable to fetch via MCP
   - Update UserDetails component
   - Test data flow end-to-end

### Phase 3: LLM Integration (Week 4)

1. **Update LLM Prompting**
   - Create system prompts for MCP tools
   - Implement tool call handling
   - Add multi-turn conversation support
   - Handle tool execution results

2. **Implement Streaming**
   - Add SSE endpoint for streaming responses
   - Update UIHub to handle streaming
   - Show real-time tool execution status

### Phase 4: Advanced Features (Week 5-6)

1. **External Services MCP Server**
   - Integrate Azure AI Search via MCP
   - Add notification tools
   - Implement report generation

2. **Analytics MCP Server**
   - Track component usage
   - Log user interactions
   - Provide insights via resources

3. **Component Discovery**
   - Implement semantic search for components
   - Add natural language component matching
   - Dynamic schema generation

### Phase 5: Testing & Optimization (Week 7-8)

1. **Testing**
   - Unit tests for MCP servers
   - Integration tests for full flow
   - E2E tests with real queries

2. **Performance Optimization**
   - Cache MCP tool/resource lists
   - Optimize LLM prompts
   - Reduce latency in tool execution

3. **Documentation**
   - MCP server setup guides
   - Tool/resource documentation
   - Architecture diagrams

## Benefits of MCP Architecture

### 1. **Extensibility**
- Add new data sources without changing Router code
- Third-party developers can create MCP servers
- Easy to integrate new tools and resources

### 2. **Modularity**
- Each MCP server is independent
- Can be developed, tested, and deployed separately
- Clear separation of concerns

### 3. **Flexibility**
- Support multiple LLM providers (OpenAI, Claude, local models)
- Standardized protocol reduces vendor lock-in
- Can mix and match different MCP servers

### 4. **Discoverability**
- LLM automatically discovers available tools/resources
- No need to pre-define all possible interactions
- Dynamic capability expansion

### 5. **Maintainability**
- Easier to update individual servers
- Clear boundaries between components
- Better error isolation

### 6. **Scalability**
- MCP servers can run on different machines
- Horizontal scaling of specific capabilities
- Load balancing across servers

### 7. **Reusability**
- MCP servers can be shared across projects
- Community-built servers available
- Standardized interface reduces development time

## Configuration Example

```json
// apps/router/config/mcp-servers.json
{
  "servers": [
    {
      "name": "ui-components",
      "command": "node",
      "args": ["dist/apps/mcp-servers/ui-components/main.js"],
      "env": {
        "NODE_ENV": "production"
      }
    },
    {
      "name": "data-sources",
      "command": "node",
      "args": ["dist/apps/mcp-servers/data-sources/main.js"],
      "env": {
        "API_URL": "https://jsonplaceholder.typicode.com",
        "NODE_ENV": "production"
      }
    },
    {
      "name": "external-services",
      "command": "node",
      "args": ["dist/apps/mcp-servers/external-services/main.js"],
      "env": {
        "AZURE_SEARCH_ENDPOINT": "https://...",
        "AZURE_SEARCH_KEY": "...",
        "NODE_ENV": "production"
      }
    }
  ]
}
```

## Security Considerations

1. **Tool Execution Validation**
   - Validate all tool arguments before execution
   - Implement rate limiting
   - Add authentication/authorization checks

2. **Resource Access Control**
   - Restrict sensitive resource access
   - Implement user-based permissions
   - Audit resource queries

3. **MCP Server Authentication**
   - Use API keys for server-to-server communication
   - Implement OAuth for user-scoped operations
   - Encrypt sensitive data in transit

4. **Input Sanitization**
   - Validate all user inputs
   - Prevent injection attacks
   - Sanitize LLM outputs before rendering

## Monitoring & Observability

1. **MCP Server Health Checks**
   - Monitor server availability
   - Track response times
   - Alert on failures

2. **Tool Usage Analytics**
   - Log all tool executions
   - Track success/failure rates
   - Identify popular tools

3. **LLM Interaction Metrics**
   - Token usage tracking
   - Response quality scoring
   - Intent accuracy measurement

## Conclusion

Migrating FrontAI to an MCP-based architecture provides significant benefits in terms of extensibility, maintainability, and scalability. The standardized protocol allows for easy integration of new capabilities, while the modular design ensures clean separation of concerns.

The phased implementation approach allows for gradual migration with minimal disruption to existing functionality. Each phase builds upon the previous one, enabling continuous delivery and testing.

This architecture positions FrontAI as a flexible, powerful platform for generative UI that can easily adapt to new requirements and integrate with diverse data sources and services.
