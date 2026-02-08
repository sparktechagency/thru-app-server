import { z } from 'zod';

export const PlanValidations = {
  create: z.object({
    body: z.object({
      title: z.string(),
      category: z.string(),
      description: z.string().optional(),
      images: z.array(z.string()),
      date: z.string().datetime(),
      endDate: z.string().datetime(),
      // longitude: z.number().optional(),
      // latitude: z.number().optional(),
      address: z.string(),
      // link: z.string().url(),
    }).strict(),
  }),

  update: z.object({
    body: z.object({
      title: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      images: z.array(z.string()).optional(),
      date: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      location: z.string().optional(),
      address: z.string().optional(),
      // longitude: z.number(),
      // latitude: z.number(),
      // link: z.string().url().optional(),
    }).strict(),
  }),

  removeFriend: z.object({
    body: z.object({
      planId: z.string(),
      userId: z.string()
    }).strict(),
  }),

  search: z.object({
    query: z.object({
      searchTerm: z.string().optional(),
      location: z.string().optional(),
      address: z.string().optional(),
      category: z.string().optional(),
      dateFilter: z.enum(['today', 'tomorrow', 'week', 'weekend', 'next_week', 'month', 'next_month', 'range']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),
};
