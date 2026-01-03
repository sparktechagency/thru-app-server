import { z } from 'zod';

export const CategoryValidations = {
  createCategoryZodSchema: z.object({
    body: z.object({
      title: z.string(),
      images: z.array(z.string()).optional(),
    }),
  }),

  updateCategoryZodSchema: z.object({
    body: z.object({
      title: z.string().optional(),
      images: z.array(z.string()).optional(),
    }),
  }),
};
