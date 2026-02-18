# MCP Migration Complete

## Summary

The FrontAI Router has been successfully migrated from "intent" terminology to **MCP (Model Context Protocol)** terminology. MCP format is now the default across all endpoints.

---

## What Changed

### 1. Response Format

**Old (Intent) Format:**
```json
{
  "confidence": 90,
  "description": "Displaying all users in a table",
  "intent": {
    "intentName": "UsersTable",
    "component": "UsersTable",
    "parameters": {}
  }
}
```

**New (MCP) Format:**
```json
{
  "confidence": 90,
  "description": "Displaying all users in a table",
  "component": "UsersTable",
  "parameters": {}
}
```

Key differences:
- No nested `intent` object
- `component` is at the top level
- Cleaner, flatter structure
- Emphasizes MCP protocol terminology

---

## Available Endpoints

### 1. Primary MCP Endpoint (Recommended)

```bash
POST /api/mcp/:sessionId/execute
```

**Purpose:** Execute MCP queries and return MCP format responses

**Example:**
```bash
curl -X POST 'http://localhost:3000/api/mcp/test/execute' \
  -H 'Content-Type: application/json' \
  -d '{"query":"Show me details for user 5"}'
```

**Response:**
```json
{
  "confidence": 95,
  "description": "Displaying user details for user 5",
  "component": "UserDetails",
  "parameters": {
    "userId": 5,
    "name": "Chelsey Dietrich",
    "email": "Lucio_Hettinger@annie.ca",
    ...
  }
}
```

---

### 2. Query Endpoint (MCP by default)

```bash
POST /api/mcp/:sessionId/query
```

**Purpose:** Unified query endpoint that returns MCP format by default, with legacy support

**Default Behavior (MCP format):**
```bash
curl -X POST 'http://localhost:3000/api/mcp/test/query' \
  -H 'Content-Type: application/json' \
  -d '{"query":"Show me all users"}'
```

**Response:** MCP format (same as `/execute` endpoint)

**Legacy Support:**
```bash
curl -X POST 'http://localhost:3000/api/mcp/test/query?format=legacy' \
  -H 'Content-Type: application/json' \
  -d '{"query":"Show me all users"}'
```

**Response:** Legacy intent format (for backward compatibility)

---

### 3. Session Management

```bash
POST /api/mcp/:sessionId/clear
```

Clear chat history for a session.

---

### 4. Introspection Endpoints

**List available MCP tools:**
```bash
GET /api/mcp/tools
```

**List available MCP resources:**
```bash
GET /api/mcp/resources
```

**Get system status:**
```bash
GET /api/mcp/status
```

**Response:**
```json
{
  "status": "ok",
  "message": "MCP Orchestrator is running",
  "mode": "mcp",
  "servers": {
    "connected": 2,
    "tools": 8,
    "resources": 4
  }
}
```

---

## Migration Guide for Clients

### If you're using the old `/api/azureai` endpoint:

1. **Switch to:** `/api/mcp/:sessionId/execute`
2. **Update response parsing:** Remove `.intent` nesting
   ```typescript
   // Old
   const component = response.intent.component;
   const params = response.intent.parameters;

   // New
   const component = response.component;
   const params = response.parameters;
   ```

### If you need backward compatibility:

Use the query endpoint with `?format=legacy`:
```bash
POST /api/mcp/:sessionId/query?format=legacy
```

---

## MCP Servers Connected

### 1. UI Components Server
- **Tools:** `load_component`
- **Purpose:** Load and display UI components
- **Location:** `dist/apps/mcp-servers/ui-components/main.js`

### 2. Data Sources Server
- **Tools:**
  - `query_users` - Search and filter users
  - `get_user_details` - Get detailed user information
  - `create_user` - Create new users
  - `update_user` - Update existing users
  - `get_user_posts` - Get posts for a user
  - `get_user_todos` - Get todos for a user
  - `query_transactions` - Query transactions (placeholder)
- **Resources:**
  - `users/list` - List all users
  - `users/{id}` - Get specific user
  - `posts/{userId}` - Get user posts
  - `todos/{userId}` - Get user todos
- **Location:** `dist/apps/mcp-servers/data-sources/main.js`

---

## System Architecture

```
┌─────────────┐
│   Client    │
│  (UIHub)    │
└──────┬──────┘
       │ HTTP POST
       ▼
┌─────────────────────────────────┐
│      Router (NestJS)            │
│                                 │
│  ┌──────────────────────────┐  │
│  │  MCP Controller          │  │
│  │  - /execute endpoint     │  │
│  │  - /query endpoint       │  │
│  └────────┬─────────────────┘  │
│           │                    │
│  ┌────────▼─────────────────┐  │
│  │  MCP Orchestrator        │  │
│  │  - Manages MCP servers   │  │
│  │  - Handles tool calls    │  │
│  │  - Multi-turn convos     │  │
│  └────────┬─────────────────┘  │
│           │                    │
│  ┌────────▼─────────────────┐  │
│  │  Azure OpenAI Service    │  │
│  │  - LLM integration       │  │
│  │  - Tool calling format   │  │
│  └──────────────────────────┘  │
└─────────┬───────────┬───────────┘
          │ stdio     │ stdio
   ┌──────▼───┐  ┌───▼─────────┐
   │    UI    │  │    Data     │
   │Components│  │   Sources   │
   │  Server  │  │   Server    │
   └──────────┘  └─────────────┘
```

---

## Testing

All tests passing with MCP format:

```bash
# Test basic component loading
curl -X POST 'http://localhost:3000/api/mcp/test/execute' \
  -H 'Content-Type: application/json' \
  -d '{"query":"Show me all users"}'
# ✅ Returns MCP format with UsersTable component

# Test multi-tool workflow (data fetch + component load)
curl -X POST 'http://localhost:3000/api/mcp/test/execute' \
  -H 'Content-Type: application/json' \
  -d '{"query":"Show me details for user 5"}'
# ✅ Returns MCP format with UserDetails component and real user data

# Test system status
curl http://localhost:3000/api/mcp/status
# ✅ Shows 2 connected servers, 8 tools, 4 resources

# Test backward compatibility
curl -X POST 'http://localhost:3000/api/mcp/test/query?format=legacy' \
  -H 'Content-Type: application/json' \
  -d '{"query":"Show me all users"}'
# ✅ Returns legacy intent format
```

---

## Implementation Details

### Files Modified

1. **[apps/router/src/app/dto/ai-response.dtos.ts](apps/router/src/app/dto/ai-response.dtos.ts)**
   - Added `McpResponseDto` interface
   - Added conversion helpers `legacyToMcpResponse()` and `mcpToLegacyResponse()`

2. **[apps/router/src/app/mcp/mcp.controller.ts](apps/router/src/app/mcp/mcp.controller.ts)**
   - Updated `/query` endpoint to return MCP format by default
   - Added `/execute` endpoint for pure MCP format
   - Enhanced `/status` endpoint with MCP server info
   - Changed log prefix from `[Legacy]` to `[MCP]`

3. **[apps/router/src/app/mcp/mcp-prompts.ts](apps/router/src/app/mcp/mcp-prompts.ts)**
   - Updated system prompt to emphasize MCP terminology
   - Added examples showing MCP server usage
   - Clarified multi-server tool execution workflow

### Configuration

**Environment:** `.env`
```bash
USE_MCP=true
```

**MCP Servers:** `config/mcp-servers.json`
```json
{
  "servers": [
    {
      "name": "ui-components",
      "transport": "stdio",
      "command": "node",
      "args": ["dist/apps/mcp-servers/ui-components/main.js"]
    },
    {
      "name": "data-sources",
      "transport": "stdio",
      "command": "node",
      "args": ["dist/apps/mcp-servers/data-sources/main.js"]
    }
  ]
}
```

---

## Next Steps

### Recommended Actions

1. **Update UIHub client** to use the new MCP endpoint:
   ```typescript
   // Change from:
   POST /api/azureai/:sessionId/query

   // To:
   POST /api/mcp/:sessionId/execute
   ```

2. **Update response parsing** to use flat MCP structure:
   ```typescript
   // Old
   const component = response.intent.component;

   // New
   const component = response.component;
   ```

3. **Remove legacy endpoint** (optional, after migration):
   - The old `/api/azureai` endpoint can be deprecated once all clients migrate

4. **Add more MCP servers** as needed:
   - Analytics server
   - Notification server
   - External API integrations

---

## Benefits of MCP Format

1. **Cleaner structure**: No nested objects, simpler to parse
2. **Protocol-focused**: Emphasizes MCP as the core architecture
3. **Extensible**: Easy to add new MCP servers and tools
4. **Standard compliance**: Follows Model Context Protocol specification
5. **Backward compatible**: Legacy format still available via query parameter

---

## Questions?

The MCP migration is complete and all endpoints are tested and working. The system now uses MCP terminology throughout, with MCP format as the default response structure.

**Status:** ✅ Production Ready
**Migration Date:** 2026-02-16
**Version:** 1.0.0-mcp
