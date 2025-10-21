import { z } from 'zod';

const UserDetailsParametersSchema = z
  .object({
    userId: z.number().describe('User Id to be shown.'),
  })
  .strict();

export const UserDetailsSchema = z.object({
  intentName: z.literal('UserDetails'),
  component: z.literal('UserDetails'),
  parameters: UserDetailsParametersSchema,
});
