import { z } from 'zod';

export const PostValidations = {
    create: z.object({
        body: z.object({
            title: z.string({
                required_error: 'Title is required',
            }),
            image: z.string().optional(),
        }),
    }),
    update: z.object({
        body: z.object({
            title: z.string().optional(),
            image: z.string().optional(),
        }),
    }),
};
