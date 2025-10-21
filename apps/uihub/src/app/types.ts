import { Context } from '@frontai/api-library';

export type CanvasInstructions = {
  intent: {
    intentName: string;
    component: string;
    parameters: Record<string, unknown>;
  };
  done: boolean;
  context?: Context;
  description?: string;
};

export enum ActionType {
  SendMsgToAI = 'SEND_MESSAGE_TO_AI',
  ResetData = 'RESET_DATA',
  FetchDataStart = 'FETCH_DATA_START',
  FetchDataSuccess = 'FETCH_DATA_SUCCESS',
  FetchDataError = 'FETCH_DATA_ERROR',
}
