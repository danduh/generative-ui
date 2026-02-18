#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// JSON Placeholder API base URL
const API_BASE_URL = process.env.API_URL || 'https://jsonplaceholder.typicode.com';

// Helper function to fetch from JSONPlaceholder API
async function fetchAPI(endpoint: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

// Helper function to post to JSONPlaceholder API
async function postAPI(endpoint: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

// Helper function to put to JSONPlaceholder API
async function putAPI(endpoint: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

// Create MCP server
const server = new Server(
  {
    name: 'data-sources',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// ========== RESOURCES ==========

// List all available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'data://users/list',
        name: 'Users List',
        description: 'List of all users from JSONPlaceholder',
        mimeType: 'application/json',
      },
      {
        uri: 'data://users/{id}',
        name: 'User Details',
        description: 'Detailed information for a specific user (replace {id} with user ID)',
        mimeType: 'application/json',
      },
      {
        uri: 'data://posts/{userId}',
        name: 'User Posts',
        description: 'Posts created by a specific user (replace {userId} with user ID)',
        mimeType: 'application/json',
      },
      {
        uri: 'data://todos/{userId}',
        name: 'User Todos',
        description: 'Todo items for a specific user (replace {userId} with user ID)',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read a specific resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'data://users/list') {
    const users = await fetchAPI('/users');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(users, null, 2),
        },
      ],
    };
  }

  // Match data://users/{id}
  const userMatch = uri.match(/^data:\/\/users\/(\d+)$/);
  if (userMatch) {
    const userId = userMatch[1];
    const user = await fetchAPI(`/users/${userId}`);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(user, null, 2),
        },
      ],
    };
  }

  // Match data://posts/{userId}
  const postsMatch = uri.match(/^data:\/\/posts\/(\d+)$/);
  if (postsMatch) {
    const userId = postsMatch[1];
    const posts = await fetchAPI(`/posts?userId=${userId}`);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(posts, null, 2),
        },
      ],
    };
  }

  // Match data://todos/{userId}
  const todosMatch = uri.match(/^data:\/\/todos\/(\d+)$/);
  if (todosMatch) {
    const userId = todosMatch[1];
    const todos = await fetchAPI(`/todos?userId=${userId}`);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(todos, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource URI: ${uri}`);
});

// ========== TOOLS ==========

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_users',
        description: 'Query users with optional filters and pagination. Returns a list of users.',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'Optional filter query (e.g., name, email)',
            },
            page: {
              type: 'number',
              description: 'Page number (default: 1)',
              default: 1,
            },
            pageSize: {
              type: 'number',
              description: 'Number of users per page (default: 10)',
              default: 10,
            },
          },
        },
      },
      {
        name: 'get_user_details',
        description: 'Get detailed information for a specific user by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'number',
              description: 'User ID',
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'create_user',
        description: 'Create a new user with the provided data.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              description: 'User email address',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            company: {
              type: 'object',
              description: 'Company information',
              properties: {
                name: {
                  type: 'string',
                  description: 'Company name',
                },
              },
            },
          },
          required: ['name', 'email'],
        },
      },
      {
        name: 'update_user',
        description: 'Update an existing user with new data.',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'number',
              description: 'User ID to update',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              description: 'User email address',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            company: {
              type: 'object',
              description: 'Company information',
              properties: {
                name: {
                  type: 'string',
                  description: 'Company name',
                },
              },
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'get_user_posts',
        description: 'Get all posts created by a specific user.',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'number',
              description: 'User ID',
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'get_user_todos',
        description: 'Get all todo items for a specific user.',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'number',
              description: 'User ID',
            },
          },
          required: ['userId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query_users': {
        const { filter, page = 1, pageSize = 10 } = args as any;
        let users = await fetchAPI('/users');

        // Apply filter if provided
        if (filter) {
          const filterLower = filter.toLowerCase();
          users = users.filter((user: any) =>
            user.name.toLowerCase().includes(filterLower) ||
            user.email.toLowerCase().includes(filterLower) ||
            user.username.toLowerCase().includes(filterLower)
          );
        }

        // Apply pagination
        const start = (page - 1) * pageSize;
        const paginatedUsers = users.slice(start, start + pageSize);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                users: paginatedUsers,
                total: users.length,
                page,
                pageSize,
                totalPages: Math.ceil(users.length / pageSize),
              }),
            },
          ],
        };
      }

      case 'get_user_details': {
        const { userId } = args as any;
        const user = await fetchAPI(`/users/${userId}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(user),
            },
          ],
        };
      }

      case 'create_user': {
        const userData = args as any;
        const newUser = await postAPI('/users', userData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(newUser),
            },
          ],
        };
      }

      case 'update_user': {
        const { userId, ...updateData } = args as any;
        const updatedUser = await putAPI(`/users/${userId}`, updateData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(updatedUser),
            },
          ],
        };
      }

      case 'get_user_posts': {
        const { userId } = args as any;
        const posts = await fetchAPI(`/posts?userId=${userId}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(posts),
            },
          ],
        };
      }

      case 'get_user_todos': {
        const { userId } = args as any;
        const todos = await fetchAPI(`/todos?userId=${userId}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(todos),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: errorMessage }),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Data Sources MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
