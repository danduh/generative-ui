import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolDefinition, JSONSchema } from '../index';

/**
 * Converts a Zod schema to an MCP tool definition
 * @param name - The name of the tool
 * @param description - Description of what the tool does
 * @param zodSchema - The Zod schema for the tool's input parameters
 * @returns MCP-compatible tool definition
 */
export function zodSchemaToMcpTool(
  name: string,
  description: string,
  zodSchema: z.ZodObject<any>
): ToolDefinition {
  const jsonSchema = zodToJsonSchema(zodSchema, {
    target: 'openApi3',
    $refStrategy: 'none',
  });

  // Remove $schema property as MCP doesn't need it
  const { $schema, ...schemaWithoutMeta } = jsonSchema as any;

  return {
    name,
    description,
    inputSchema: schemaWithoutMeta as JSONSchema,
  };
}

/**
 * Converts multiple Zod schemas to MCP tool definitions
 * @param schemas - Array of {name, description, schema} objects
 * @returns Array of MCP-compatible tool definitions
 */
export function zodSchemasToMcpTools(
  schemas: Array<{
    name: string;
    description: string;
    schema: z.ZodObject<any>;
  }>
): ToolDefinition[] {
  return schemas.map(({ name, description, schema }) =>
    zodSchemaToMcpTool(name, description, schema)
  );
}
