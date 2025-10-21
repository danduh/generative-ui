import { z } from 'zod';

const ComponentParams = z
  .object({
    accountType: z
      .string()
      .describe('Type of account for which the balance is requested.'),
  })
  .strict();

export const BalancesViewSchema = z.object({
  intentName: z.literal('BalancesView'),
  component: z.literal('BalancesView'),
  parameters: ComponentParams,
});
