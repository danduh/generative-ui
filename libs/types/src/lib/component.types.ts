import { Context } from '@frontai/api-library';

export interface AIComponentProps {
  setFurtherInstructions?: (prompt: string) => void;
  mainAction?: (args?: object) => any;
  logger?: (args?: object) => void;
  intent: {
    context?: any;
    intentName: string;
    component: string;
    parameters: Record<string, unknown>;
  };
  context?: Context;
}
