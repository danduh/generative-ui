import {Module} from '@nestjs/common';
import {AzureOpenAIService} from "./azureai/azure-openai.service";
import {AzureOpenAIController} from "./azureai/azure-openai.controller";
import { OpenAiController } from './openia/openai.controller';
import { OpenAiService } from './openia/openai.service';
import { ConfigModule } from '@nestjs/config';
import { ChatHistoryService } from './services/chat-history.service';
import { McpController } from './mcp/mcp.controller';
import { McpOrchestratorService } from './mcp/mcp-orchestrator.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AzureOpenAIController, OpenAiController, McpController],
  providers: [AzureOpenAIService, OpenAiService, ChatHistoryService, McpOrchestratorService],
})
export class AppModule {
}
