import { z } from 'zod';
import {
  EditUserForm,
  UserDetailsSchema,
  UsersTableSchema,
  BalancesViewSchema,
  CreditCardsListSchema,
  TransactionDetailsSchema,
  TransactionsListSchema,
  UnknownIntentSchema,
  AvatarLiveViewSchema
} from './schemas';

const IntentSchema = z.union([
  EditUserForm,
  UserDetailsSchema,
  UsersTableSchema,
  BalancesViewSchema,
  CreditCardsListSchema,
  TransactionDetailsSchema,
  TransactionsListSchema,
  UnknownIntentSchema,
  AvatarLiveViewSchema
]);

const UserQueryIntentSchema = z
  .object({
    description: z
      .string()
      .describe(
        'A short explanation of the action or RAG-based information if applicable.'
      ),
    confidence: z
      .number()
      .describe(
        'The percentage of confidence from the identification of the intent ranging from 0 to 99.'
      ),
    intent: IntentSchema,
  })
  .strict();

export { UserQueryIntentSchema };
