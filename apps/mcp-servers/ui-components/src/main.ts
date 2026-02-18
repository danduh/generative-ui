import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Component metadata - kept in sync with @frontai/registry
const componentMetadata = {
  UsersTable: {
    description: 'Display a table of all users with their basic information',
    requiredFields: ['intentName', 'component'],
  },
  UserDetails: {
    description: 'Show detailed information for a specific user',
    requiredFields: ['intentName', 'component'],
  },
  EditUserForm: {
    description: 'Display a form to edit or create a user',
    requiredFields: ['intentName', 'component'],
  },
  BalancesView: {
    description: 'Show account balances for a user',
    requiredFields: ['intentName', 'component'],
  },
  CreditCardsList: {
    description: 'Display a list of credit cards',
    requiredFields: ['intentName', 'component'],
  },
  TransactionDetails: {
    description: 'Show detailed information for a specific transaction',
    requiredFields: ['intentName', 'component'],
  },
  TransactionsList: {
    description: 'Display a list of transactions',
    requiredFields: ['intentName', 'component'],
  },
  UnknownIntent: {
    description: 'Default component when intent cannot be determined',
    requiredFields: ['intentName'],
  },
  AvatarLiveView: {
    description: 'Display a live avatar view for interaction',
    requiredFields: ['intentName', 'component'],
  },
};

type ComponentName = keyof typeof componentMetadata;

// Create MCP Server
const server = new Server(
  {
    name: 'ui-components',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List all available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'component://available-components',
        name: 'Available UI Components',
        description: 'List of all available UI components and their descriptions',
        mimeType: 'application/json',
      },
      ...Object.keys(componentMetadata).map((name) => ({
        uri: `component://schemas/${name}`,
        name: `${name} Schema`,
        description: `Schema information for ${name} component`,
        mimeType: 'application/json',
      })),
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'component://available-components') {
    const components = Object.entries(componentMetadata).map(([name, meta]) => ({
      name,
      description: meta.description,
      requiredFields: meta.requiredFields,
    }));

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(components, null, 2),
        },
      ],
    };
  }

  const schemaMatch = uri.match(/^component:\/\/schemas\/(.+)$/);
  if (schemaMatch) {
    const componentName = schemaMatch[1] as ComponentName;
    const metadata = componentMetadata[componentName];

    if (!metadata) {
      throw new Error(`Component ${componentName} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              name: componentName,
              description: metadata.description,
              requiredFields: metadata.requiredFields,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'load_component',
        description:
          'Load a UI component with validated parameters. Returns the component intent that UIHub will use to render the component.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name (e.g., UsersTable, UserDetails)',
              enum: Object.keys(componentMetadata),
            },
            parameters: {
              type: 'object',
              description: 'Component-specific parameters (optional)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'discover_components',
        description:
          'Search for components by description or functionality. Useful when you need to find the right component for a task.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (e.g., "show user details", "list transactions")',
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'load_component') {
    const { name: componentName, parameters = {} } = args as {
      name: string;
      parameters?: Record<string, any>;
    };

    const metadata = componentMetadata[componentName as ComponentName];
    if (!metadata) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Component ${componentName} not found`,
              availableComponents: Object.keys(componentMetadata),
            }),
          },
        ],
      };
    }

    // Return component intent
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            intentName: componentName,
            component: componentName,
            parameters: parameters,
            description: metadata.description,
          }),
        },
      ],
    };
  }

  if (name === 'discover_components') {
    const { query } = args as { query: string };
    const lowerQuery = query.toLowerCase();

    // Simple keyword-based search
    const matches = Object.entries(componentMetadata)
      .filter(
        ([name, meta]) =>
          name.toLowerCase().includes(lowerQuery) ||
          meta.description.toLowerCase().includes(lowerQuery)
      )
      .map(([name, meta]) => ({
        name,
        description: meta.description,
        relevance: 'high',
      }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query,
            matches: matches.length > 0 ? matches : [
              {
                name: 'UnknownIntent',
                description: 'No matching component found',
                relevance: 'default',
              },
            ],
          }),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UI Components MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
