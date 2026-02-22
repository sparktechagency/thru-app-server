import { z } from 'zod';

export const ActivityValidations = {
  create: z.object({
    body: z.object({
      title: z.string({
        required_error: 'Title is required',
      }),
      planId: z.string(),
      category: z.enum(["eatAndDrink", "stays", "transportation", "custom", "activity"], {
        required_error: 'Category is required',
      }),
      description: z.string().optional(),
      address: z.string({
        required_error: 'Address is required',
      }),
      date: z.string({
        required_error: 'Date is required',
      }).datetime(),
      endDate: z.string().optional(),
      link: z.string().optional(),
      images: z.array(z.string()).optional(),
    }).strict(),
  }),

  update: z.object({
    body: z.object({
      title: z.string().optional(),
      category: z.enum(["eatAndDrink", "stays", "transportation", "custom", "activity"]).optional(),
      description: z.string().optional(),
      address: z.string().optional(),
      date: z.string().optional(),
      endDate: z.string().optional(),
      link: z.string().optional(),
      images: z.array(z.string()).optional(),
    }).strict(),
  }),
};
