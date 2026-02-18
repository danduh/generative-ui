import { Injectable } from '@nestjs/common';
import { AzureOpenAI } from 'openai';
import 'dotenv/config';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ConfigService } from '@nestjs/config';
import { ChatHistoryService } from '../services/chat-history.service';
import { ResponseDto } from '../dto/ai-response.dtos';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/src/resources/chat/completions';
import { UserQueryIntentSchema } from '@frontai/registry';
import { zodResponseFormat } from 'openai/helpers/zod';

@Injectable()
export class AzureOpenAIService {
  private endpoint: string;
  private apiKey: string;
  private deployment: string;
  private searchEndpoint: string;
  private searchKey: string;
  private searchIndex: string;
  private client: AzureOpenAI;
  private apiVersion: string;

  constructor(
    private configService: ConfigService,
    private chatHistory: ChatHistoryService
  ) {
    // console.log(
    //   this.configService.get<string>('AZURE_OPENAI_ENDPOINT'),
    //   this.configService.get<string>('AZURE_OPENAI_API_KEY')
    // );
    this.endpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT');
    this.apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    this.deployment = this.configService.get<string>(
      'AZURE_OPENAI_DEPLOYMENT_ID'
    );
    this.searchEndpoint = this.configService.get<string>(
      'AZURE_AI_SEARCH_ENDPOINT'
    );
    this.searchKey = this.configService.get<string>('AZURE_AI_SEARCH_API_KEY');
    this.searchIndex = this.configService.get<string>('AZURE_AI_SEARCH_INDEX');
    this.apiVersion = this.configService.get<string>('API_VERSION');

    this.client = new AzureOpenAI({
      apiKey: this.apiKey,
      endpoint: this.endpoint,
      deployment: this.deployment,
      apiVersion: this.apiVersion,
    });
  }

  async interactWithAssistant(
    sessionId: string,
    userQuery: string
  ): Promise<ResponseDto> {
    const chatHistory = this.chatHistory.getChatHistory(sessionId);
    chatHistory.push({ role: 'user', content: userQuery });
    /*** RESPONSE_FORMAT ***/
    const response_format = zodResponseFormat(
      UserQueryIntentSchema,
      'user_query_intent_schema'
    );
    console.log('RESPONSE_FORMAT', JSON.stringify(response_format, null, 2))
    const payload = {
      model: '',
      messages: chatHistory as ChatCompletionMessageParam[],
      max_tokens: 200,
      temperature: 0.7, 
      response_format, // <-- RESPONSE_FORMAT HERE
    } as ChatCompletionCreateParamsNonStreaming;
    let completion;
    try {
      completion = await this.client.beta.chat.completions.parse<
        typeof payload,
        ResponseDto
      >(payload);
    } catch (e) {
      console.error(e);
    }
    const intent_response = completion.choices[0].message;
    console.log('intent_response', intent_response)
    if (intent_response.refusal) {
      return {
        confidence: 0,
        intent: {
          intentName: 'UnknownIntent',
          parameters: {},
        },
        description: 'I do not understand you',
      };
    } else {
      if (
        intent_response?.parsed &&
        intent_response?.parsed.intent.intentName === 'UnknownIntent'
      ) {
        return this.callAsyncRAG(chatHistory) as any;
      }
      return intent_response.parsed;
    }
  }

  async interactWithAssistantWithTools(
    sessionId: string,
    userQuery: string,
    tools: Array<{ type: 'function'; function: { name: string; description: string; parameters: any } }>
  ): Promise<any> {
    const chatHistory = this.chatHistory.getChatHistory(sessionId);

    const payload = {
      model: '',
      messages: chatHistory as ChatCompletionMessageParam[],
      max_tokens: 500,
      temperature: 0.7,
      tools,
      tool_choice: 'auto' as const,
    } as ChatCompletionCreateParamsNonStreaming;

    try {
      console.log('[AzureOpenAI] Calling LLM with', chatHistory.length, 'messages');
      const completion = await this.client.chat.completions.create(payload);
      const message = completion.choices[0].message;

      // Check if there are tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log('[AzureOpenAI] LLM returned', message.tool_calls.length, 'tool calls');
        message.tool_calls.forEach((tc, i) => {
          console.log(`[AzureOpenAI] Tool call ${i + 1}: ${tc.function.name}(${tc.function.arguments})`);
        });

        // Add assistant message with tool_calls to history
        chatHistory.push({
          role: 'assistant',
          content: message.content || '',
          tool_calls: message.tool_calls,
        } as any);

        return {
          toolCalls: message.tool_calls.map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments),
          })),
        };
      }

      // Add assistant message to history (no tool calls)
      if (message.content) {
        console.log('[AzureOpenAI] LLM content response:', message.content.substring(0, 200));
        chatHistory.push({ role: 'assistant', content: message.content });
      }

      // No tool calls, try to extract intent from response
      if (message.content) {
        try {
          const parsed = JSON.parse(message.content);
          console.log('[AzureOpenAI] Parsed JSON response:', JSON.stringify(parsed).substring(0, 200));

          // Check if parsed has intent object (new format)
          if (parsed.intent && (parsed.intent.intentName || parsed.intent.component)) {
            console.log('[AzureOpenAI] Returning intent:', parsed.intent.component);
            return {
              confidence: parsed.confidence || 80,
              description: parsed.description || message.content,
              intent: {
                intentName: parsed.intent.intentName || parsed.intent.component,
                component: parsed.intent.component || parsed.intent.intentName,
                parameters: parsed.intent.parameters || {},
              },
            };
          }
          // Check if parsed has intentName directly (old format)
          if (parsed.intentName || parsed.component) {
            console.log('[AzureOpenAI] Returning intent (old format):', parsed.component || parsed.intentName);
            return {
              confidence: parsed.confidence || 80,
              description: parsed.description || message.content,
              intent: {
                intentName: parsed.intentName || parsed.component,
                component: parsed.component || parsed.intentName,
                parameters: parsed.parameters || {},
              },
            };
          }
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : String(e);
          console.log('[AzureOpenAI] Failed to parse JSON:', errorMsg);
          // Not JSON, return as UnknownIntent
        }
      }

      return {
        confidence: 50,
        description: message.content || 'No response',
        intent: {
          intentName: 'UnknownIntent',
          component: 'UnknownIntent',
        },
      };
    } catch (error) {
      console.error('Error in interactWithAssistantWithTools', error);
      throw error;
    }
  }

  async callAsyncRAG(chatHistory) {
    const payload = {
      model: '',
      messages: chatHistory as ChatCompletionMessageParam[],
      max_tokens: 200,
      temperature: 0.7, // Adjust temperature for response creativity
      response_format: {
        type: 'text',
      },
      data_sources: [
        {
          type: 'azure_search',
          parameters: {
            endpoint: this.searchEndpoint,
            index_name: this.searchIndex,
            semantic_configuration: 'default',
            query_type: 'simple',
            fields_mapping: {},
            in_scope: true,
            filter: null,
            strictness: 3,
            top_n_documents: 5,
            authentication: {
              type: 'api_key',
              key: this.searchKey,
            },
          },
        },
      ],
    } as ChatCompletionCreateParamsNonStreaming;

    const completion = await this.client.beta.chat.completions.parse(payload);
    const message = completion.choices[0].message as any;
    let intent_response: ResponseDto;
    try {
      intent_response = JSON.parse(message.content) as any;
    } catch (e) {
      console.error('FAILED TO PARSE RESPONSE');
      console.error(JSON.stringify(message.content));
      console.error(e);
    }

    intent_response.intent = {
      intentName: 'UnknownIntent',
      context: message.context,
      component: 'UnknownIntent',
    };
    return intent_response;
  }
}
