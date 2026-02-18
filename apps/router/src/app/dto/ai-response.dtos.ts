import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({
    description: 'The user query to process',
    example: 'Show me all users',
  })
  query!: string;
}

// Legacy response format (for backward compatibility)
export class ResponseDto {
  @ApiProperty({
    description: 'Confidence score (0-100) of the intent recognition',
    example: 90,
    minimum: 0,
    maximum: 100,
  })
  confidence: number;

  @ApiProperty({
    description: 'Human-readable description of the action taken',
    example: 'Displaying all users in a table',
  })
  description: string;

  @ApiProperty({
    description: 'Intent information with component details',
    example: {
      intentName: 'UsersTable',
      component: 'UsersTable',
      parameters: {},
    },
  })
  intent: {
    intentName: 'UnknownIntent' | string;
    component?: string;
    parameters?: Record<string, unknown>;
    context?: any[];
  };
}

// New MCP response format
export class McpResponseDto {
  @ApiProperty({
    description: 'Confidence score (0-100) of the response',
    example: 95,
    minimum: 0,
    maximum: 100,
  })
  confidence: number;

  @ApiProperty({
    description: 'Human-readable description of the action taken',
    example: 'Displaying user details for user 5',
  })
  description: string;

  @ApiProperty({
    description: 'Component to render',
    example: 'UserDetails',
  })
  component!: string;

  @ApiProperty({
    description: 'Component parameters',
    example: {
      userId: 5,
      name: 'Chelsey Dietrich',
      email: 'Lucio_Hettinger@annie.ca',
    },
    required: false,
  })
  parameters?: Record<string, unknown>;

  @ApiProperty({
    description: 'Additional context information',
    required: false,
    type: [Object],
  })
  context?: any[];
}

// Helper to convert MCP response to legacy format
export function mcpToLegacyResponse(mcp: McpResponseDto): ResponseDto {
  return {
    confidence: mcp.confidence,
    description: mcp.description,
    intent: {
      intentName: mcp.component,
      component: mcp.component,
      parameters: mcp.parameters,
      context: mcp.context,
    },
  };
}

// Helper to convert legacy response to MCP format
export function legacyToMcpResponse(legacy: ResponseDto): McpResponseDto {
  return {
    confidence: legacy.confidence,
    description: legacy.description,
    component: legacy.intent.component || legacy.intent.intentName,
    parameters: legacy.intent.parameters,
    context: legacy.intent.context,
  };
}
