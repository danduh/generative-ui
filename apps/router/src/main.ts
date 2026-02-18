/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('FrontAI Router API')
    .setDescription(`
      ## FrontAI Router - MCP-Powered AI Assistant API

      This API provides endpoints for interacting with FrontAI, an MCP (Model Context Protocol) powered AI assistant
      that helps users interact with financial data and UI components.

      ### Architecture

      The Router uses MCP to orchestrate multiple specialized servers:
      - **UI Components Server**: Loads and renders UI components
      - **Data Sources Server**: Fetches data from external sources (users, transactions, etc.)

      ### Recommended Endpoints

      For new integrations, use the **MCP** endpoints:
      - \`POST /api/mcp/:sessionId/execute\` - Recommended for all new integrations
      - \`POST /api/mcp/:sessionId/query\` - Unified endpoint with format options

      ### Response Formats

      **MCP Format (Recommended):**
      \`\`\`json
      {
        "confidence": 95,
        "description": "Displaying user details",
        "component": "UserDetails",
        "parameters": { "userId": 5, "name": "John Doe" }
      }
      \`\`\`

      **Legacy Intent Format:**
      \`\`\`json
      {
        "confidence": 95,
        "description": "Displaying user details",
        "intent": {
          "intentName": "UserDetails",
          "component": "UserDetails",
          "parameters": { "userId": 5 }
        }
      }
      \`\`\`

      ### Features

      - **Multi-tool Workflow**: LLM can chain multiple MCP tool calls (fetch data, then display component)
      - **Session Management**: Maintains conversation history per session
      - **MCP Protocol**: Standardized tool and resource discovery
      - **Real-time Data**: Fetches live data from external APIs
    `)
    .setVersion('1.0.0')
    .addTag('MCP', 'Model Context Protocol endpoints (Recommended)')
    .addTag('OpenAI (Legacy)', 'Legacy OpenAI assistant endpoints')
    .addTag('Azure OpenAI (Legacy)', 'Legacy Azure OpenAI endpoints')
    .addServer('http://localhost:3000', 'Local development server')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    customSiteTitle: 'FrontAI Router API Documentation',
    customfavIcon: 'https://swagger.io/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  const port = process.env.PORT || 3000;

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/api`
  );
}

bootstrap();
