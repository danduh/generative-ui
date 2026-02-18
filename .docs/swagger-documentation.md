# Swagger API Documentation

## Accessing Swagger UI

The FrontAI Router includes comprehensive Swagger/OpenAPI documentation for all endpoints.

### Local Development

When the router is running locally, access Swagger at:

```
http://localhost:3000/api
```

### Features

The Swagger documentation includes:

- **Interactive API Testing**: Try out endpoints directly from the browser
- **Request/Response Examples**: See example payloads for each endpoint
- **Schema Definitions**: View detailed structure of request and response objects
- **Endpoint Descriptions**: Comprehensive documentation for each API
- **Multiple Response Format Examples**: See both MCP and legacy formats

## API Organization

The API is organized into 3 main tags:

### 1. MCP (Recommended) ⭐

**Model Context Protocol endpoints** - Use these for all new integrations

#### Key Endpoints:

**`POST /api/mcp/{sessionId}/execute`** ⭐ Recommended
- Execute MCP query with pure MCP format response
- Best for new integrations
- Examples:
  - Simple: "Show me all users"
  - Data fetch: "Show me details for user 5"
  - Create: "Create a new user with name John Doe"

**`POST /api/mcp/{sessionId}/query`**
- Unified endpoint supporting both formats
- Default: MCP format
- Legacy support: Add `?format=legacy` query parameter

**`GET /api/mcp/status`**
- Check MCP system status
- Shows connected servers, available tools and resources

**`GET /api/mcp/tools`**
- List all available MCP tools from connected servers

**`GET /api/mcp/resources`**
- List all available MCP resources

**`POST /api/mcp/{sessionId}/clear`**
- Clear conversation history for a session

### 2. OpenAI (Legacy)

Legacy OpenAI endpoints - maintained for backward compatibility

- `POST /api/openai/{sessionId}/query`
- `POST /api/openai/{sessionId}/clear`

### 3. Azure OpenAI (Legacy)

Legacy Azure OpenAI endpoints - maintained for backward compatibility

- `POST /api/azureai/{sessionId}/query`
- `POST /api/azureai/{sessionId}/clear`

## Testing with Swagger UI

### 1. Open Swagger UI

Navigate to `http://localhost:3000/api` in your browser

### 2. Expand an Endpoint

Click on any endpoint to see:
- Summary and description
- Parameters
- Request body schema
- Response schemas
- Example values

### 3. Try It Out

1. Click **"Try it out"** button
2. Fill in parameters:
   - `sessionId`: e.g., "user123"
   - `query`: e.g., "Show me all users"
3. Click **"Execute"**
4. View the response:
   - Response body
   - HTTP status code
   - Response headers

### Example Test Queries

```
Show me all users
Show me details for user 5
Get posts for user 3
Show user 1's todos
Create a new user with name Jane Smith and email jane@example.com
```

## Response Format Comparison

### MCP Format (Recommended)

```json
{
  "confidence": 95,
  "description": "Displaying user details for user 5",
  "component": "UserDetails",
  "parameters": {
    "userId": 5,
    "name": "Chelsey Dietrich",
    "email": "Lucio_Hettinger@annie.ca",
    "phone": "(254)954-1289"
  }
}
```

**Benefits:**
- Flat structure (no nested objects)
- Simpler to parse
- Component-first design
- MCP protocol compliant

### Legacy Intent Format

```json
{
  "confidence": 95,
  "description": "Displaying user details for user 5",
  "intent": {
    "intentName": "UserDetails",
    "component": "UserDetails",
    "parameters": {
      "userId": 5,
      "name": "Chelsey Dietrich"
    }
  }
}
```

**When to use:**
- Only for backward compatibility
- Add `?format=legacy` to `/query` endpoint

## OpenAPI Specification

### Download Spec

Get the OpenAPI JSON specification:
```bash
curl http://localhost:3000/api-json > frontai-openapi.json
```

### Use with Code Generators

Generate client libraries using tools like:
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger Codegen](https://swagger.io/tools/swagger-codegen/)
- [AutoRest](https://github.com/Azure/autorest)

Example:
```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3000/api-json \
  -g typescript-axios \
  -o ./generated-client

# Generate Python client
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3000/api-json \
  -g python \
  -o ./python-client
```

## Schema Definitions

### QueryDto

Request body for all query endpoints:

```typescript
{
  query: string; // User query to process
}
```

### McpResponseDto

MCP format response:

```typescript
{
  confidence: number;    // 0-100
  description: string;   // Human-readable description
  component: string;     // Component name to render
  parameters?: object;   // Component parameters
  context?: any[];      // Additional context
}
```

### ResponseDto

Legacy format response:

```typescript
{
  confidence: number;
  description: string;
  intent: {
    intentName: string;
    component?: string;
    parameters?: object;
    context?: any[];
  }
}
```

## Swagger Customizations

The Swagger UI includes:

- **Custom Title**: "FrontAI Router API Documentation"
- **Persist Authorization**: Keep auth tokens between page refreshes
- **Sorted Tags**: Alphabetically sorted for easy navigation
- **Sorted Operations**: Operations within tags are sorted
- **Rich Descriptions**: Markdown-formatted descriptions with examples
- **Multiple Examples**: See different use cases per endpoint

## Tips

1. **Session IDs**: Use any string for testing (e.g., "test", "demo", "user123")
2. **Clear History**: Use the `/clear` endpoint to reset conversation context
3. **Check Status**: Use `/status` to verify MCP servers are connected
4. **Explore Tools**: Use `/tools` to see what operations are available
5. **MCP First**: Always use MCP endpoints for new integrations

## Troubleshooting

### Swagger UI Not Loading

```bash
# Check if server is running
curl http://localhost:3000/api/mcp/status

# Check Swagger JSON
curl http://localhost:3000/api-json
```

### 404 on Swagger UI

Make sure you're accessing:
- ✅ `http://localhost:3000/api` (correct)
- ❌ `http://localhost:3000/swagger` (wrong)
- ❌ `http://localhost:3000/docs` (wrong)

### Cannot Execute Requests

1. Make sure router is running
2. Check browser console for CORS errors
3. Verify endpoint path includes `/api` prefix

## Next Steps

- Explore the interactive documentation at `http://localhost:3000/api`
- Try the recommended `/execute` endpoint
- Check the system status with `/status`
- Review the available tools with `/tools`
- Test multi-tool workflows with complex queries
