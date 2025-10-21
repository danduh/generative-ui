export interface Citation {
  content: string;
  title: string | null;
  url: string | null;
  filepath: string | null;
  chunk_id: string;
}

/**
 * Represents the overall context, which includes:
 * - an array of Citation objects
 * - the user's intent (array of strings, e.g. ["How to reset my password?"])
 */
export interface Context {
  citations: Citation[];
  intent: string[];
}

export interface ResponseDto {
  component: string;
  description: string;
  intent: {
    intentName: string;
    component: string;
    parameters: Record<string, unknown>;
  };
  context: Context;
}
