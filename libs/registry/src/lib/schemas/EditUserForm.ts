import { z } from 'zod';

const ComponentParams = z
  .object({
    name: z.string().describe("User's name, should be provided by user"),
    email: z.string().describe('User email, should be provided by user'),
    company: z
      .object({
        name: z.string().describe('Company Name'),
      })
      .describe('User company details'),
  })
  .strict();

export const EditUserForm = z.object({
  intentName: z.literal('Edit_OR_CREATE_User'),
  component: z.literal('EditUserForm'),
  parameters: ComponentParams,
}).describe("User form for editing or creating a new user, if no details provided, ask for missing details, if all details provided ask to click on SAVE button to proceed.");
