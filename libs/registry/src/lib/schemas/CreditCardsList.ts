import { z } from 'zod';

const ComponentParams = z
  .object({
    cardStatus: z.string().describe('Status of the credit cards to filter by.'),
  })
  .strict();

export const CreditCardsListSchema = z.object({
  intentName: z.literal('CreditCardsList'),
  component: z.literal('CreditCardsList'),
  parameters: ComponentParams,
});
