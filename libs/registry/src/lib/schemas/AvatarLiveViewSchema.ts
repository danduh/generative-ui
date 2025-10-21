import { z } from 'zod';

const ComponentParams = z
  .object({
    accountType: z
      .string()
      .describe('Show live representative view, real person, avatar'),
  })
  .strict();

export const AvatarLiveViewSchema = z.object({
  intentName: z.literal('AvatarLiveView'),
  component: z.literal('AvatarLiveView'),
  parameters: ComponentParams,
});
