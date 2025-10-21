import { z } from 'zod';

export const UsersTableSchema = z.object({
  intentName: z.literal('UsersTable'),
  component: z.literal('UsersTable'),
});
