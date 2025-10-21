import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty() query: string;
}

export class ResponseDto {
  confidence: number;
  description: string;
  intent: {
    intentName: 'UnknownIntent' | string;
    component?: string;
    parameters?: Record<string, unknown>;
    context?: any[];
  };
}
