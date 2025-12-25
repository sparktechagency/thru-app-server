import { z } from 'zod';
import { Types } from 'mongoose';

export const CommentValidations = {
    create: z.object({
        body: z.object({
            planId: z.string().refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid planId',
            }),
            content: z.string({
                required_error: 'Content is required',
            }),
        }),
    }),
};
