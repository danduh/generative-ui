import { ActionType } from './types';

export interface AppState {
  data?: any;
  loading?: boolean;
  error?: string | null;
}

type Action =
  | { type: ActionType.SendMsgToAI; payload: any }
  | { type: ActionType.ResetData }

export const chatApiReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case ActionType.SendMsgToAI:
      return { ...state, data: action.payload };

    case ActionType.ResetData:
      return { ...state, data: null };

    default:
      return state;
  }
};
