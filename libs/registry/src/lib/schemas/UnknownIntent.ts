import { z } from 'zod';

const ComponentParams = z
  .object({
    param_name: z.string().describe('The name of the parameter extracted.'),
  })
  .strict();

export const UnknownIntentSchema = z.object({
  intentName: z.literal('UnknownIntent'),
  component: z.literal('UnknownIntent'),
  parameters: ComponentParams,
});
