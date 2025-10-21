import { z } from 'zod';

const ComponentParams = z
  .object({
    transactionId: z
      .string()
      .describe('The ID of the transaction to display details for.'),
  })
  .strict();

export const TransactionDetailsSchema = z.object({
  intentName: z.literal('TransactionDetails'),
  component: z.literal('TransactionDetails'),
  parameters: ComponentParams,
});
