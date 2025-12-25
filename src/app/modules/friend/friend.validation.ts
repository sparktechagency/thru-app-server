import { z } from 'zod';

export const FriendValidations = {
  create: z.object({
    users: z.array(z.string()),
    requestId: z.string(),
  }),

  update: z.object({
    users: z.array(z.string()).optional(),
    requestId: z.string().optional(),
  }),
};
