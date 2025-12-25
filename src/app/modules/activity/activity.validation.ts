import { z } from 'zod';

export const ActivityValidations = {
  create: z.object({
    title: z.string(),
    externalId: z.string(),
    description: z.string().optional(),
    address: z.string(),
    date: z.string().datetime(),
    images: z.array(z.string()),
  }),

  update: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    date: z.string().datetime().optional(),
    images: z.array(z.string()).optional(),
  }),
};
