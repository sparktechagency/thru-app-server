import { z } from 'zod';

export const MessageValidations = {
    sendMessage: z.object({
        body: z.object({
            message: z.string({
                required_error: 'Message content is required',
            }).optional(),
            images: z.array(z.string()).optional(),
        }).strict(),
    }),

    updateMessage: z.object({
        body: z.object({
            message: z.string({
                required_error: 'Message content is required',
            }),
            images: z.array(z.string()).optional(),
        }).strict(),
    }),
};
