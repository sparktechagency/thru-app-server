import { z } from 'zod';

export const PlanValidations = {
  create: z.object({
    body: z.object({
      title: z.string({
        required_error: 'Title is required',
      }),
      description: z.string().optional(),
      images: z.array(z.string()).optional(),
      date: z.string({
        required_error: 'Date is required',
      }).datetime(),
      endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid endDate'
      }),
      address: z.string({
        required_error: 'Address is required',
      }),
      eatAndDrink: z.array(z.string()).optional(),
      stays: z.array(z.string()).optional(),
      transportation: z.array(z.string()).optional(),
      custom: z.array(z.string()).optional(),
      activities: z.array(z.string()).optional(),
      collaborators: z.array(z.string()).optional(),
    }).strict(),
  }),

  update: z.object({
    body: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      images: z.array(z.string()).optional(),
      date: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      address: z.string().optional(),
      eatAndDrink: z.array(z.string()).optional(),
      stays: z.array(z.string()).optional(),
      transportation: z.array(z.string()).optional(),
      custom: z.array(z.string()).optional(),
      activities: z.array(z.string()).optional(),
      collaborators: z.array(z.string()).optional(),
    }).strict(),
  }),

  addCollaborator: z.object({
    body: z.object({
      planId: z.string({
        required_error: 'Plan ID is required'
      }),
      userId: z.string({
        required_error: 'User ID is required'
      })
    }).strict(),
  }),

  removeCollaborator: z.object({
    body: z.object({
      planId: z.string({
        required_error: 'Plan ID is required'
      }),
      userId: z.string({
        required_error: 'User ID is required'
      })
    }).strict(),
  }),
};
