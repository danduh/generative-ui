import { z } from 'zod';

const ComponentParams = z
  .object({
    dateRange: z.string().describe('The date range for the transaction list.'),
  })
  .strict();

export const TransactionsListSchema = z.object({
  intentName: z.literal('TransactionsList'),
  component: z.literal('TransactionsList'),
  parameters: ComponentParams,
}).describe("List all user's transactions.");
