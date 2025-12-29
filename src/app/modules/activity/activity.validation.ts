import { z } from 'zod';

export const ActivityValidations = {
  create: z.object({
    body: z.object({
      title: z.string(),
      externalId: z.string(),
      description: z.string().optional(),
      address: z.string(),
      date: z.string().datetime(),
      link: z.string().url().optional(),
      images: z.array(z.string()),
    })
  }),

  update: z.object({
    body: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      address: z.string().optional(),
      date: z.string().datetime().optional(),
      link: z.string().url().optional(),
      images: z.array(z.string()).optional(),
    })
  }),

  addToPlan: z.object({
    body: z.object({
      planId: z.string(),
      title: z.string(),
      externalId: z.string(),
      description: z.string().optional(),
      address: z.string(),
      date: z.string().datetime(),
      link: z.string().url().optional(),
      images: z.array(z.string()).optional(),
    })
  }),

  removeFromPlan: z.object({
    body: z.object({
      planId: z.string(),
      activityId: z.string()
    })
  }),

  createWithActivity: z.object({
    body: z.object({
      title: z.string(),
      externalId: z.string(),
      description: z.string().optional(),
      address: z.string(),
      date: z.string().datetime(),
      images: z.array(z.string()).optional(),
    })
  })
};
