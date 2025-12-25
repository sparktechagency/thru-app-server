import { z } from 'zod';

export const PlanValidations = {
  create: z.object({
    title: z.string(),
    description: z.string().optional(),
    images: z.array(z.string()),
    date: z.string().datetime(),
    longitude: z.number().optional(),
    latitude: z.number().optional(),
    address: z.string(),
    link: z.string().url(),
  }),

  update: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    date: z.string().datetime().optional(),
    location: z.string().optional(),
    address: z.string().optional(),
    longitude: z.number(),
    latitude: z.number(),
    link: z.string().url().optional(),

  }),

  removeFriend: z.object({
    body: z.object({
      planId: z.string(),
      userId: z.string()
    })
  }),
};
