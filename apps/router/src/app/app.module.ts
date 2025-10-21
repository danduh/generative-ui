import {Module} from '@nestjs/common';
import {AzureOpenAIService} from "./azureai/azure-openai.service";
import {AzureOpenAIController} from "./azureai/azure-openai.controller";
import { OpenAiController } from './openia/openai.controller';
import { OpenAiService } from './openia/openai.service';
import { ConfigModule } from '@nestjs/config';
import { ChatHistoryService } from './services/chat-history.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AzureOpenAIController, OpenAiController],
  providers: [AzureOpenAIService, OpenAiService, ChatHistoryService],
})
export class AppModule {
}
