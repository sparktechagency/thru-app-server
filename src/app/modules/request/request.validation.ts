import { z } from 'zod';
import { REQUEST_STATUS } from './request.interface';
import { Types } from 'mongoose';

export const RequestValidations = {
  create: z.object({
    params: z.object({
      requestedTo: z.string(),
    })
  }),

  update: z.object({
    body: z.object({
      status: z.nativeEnum(REQUEST_STATUS).optional()
    }),
    params: z.object({
      id: z.string().refine((value) => Types.ObjectId.isValid(value), 'Invalid request id')
    })
  }),

  createPlanRequest: z.object({
    body: z.object({
      requestedTo: z.string(),
      planId: z.string()
    })
  }),
};
