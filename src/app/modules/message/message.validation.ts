import { z } from 'zod';

export const MessageValidations = {
    sendMessage: z.object({
        body: z.object({
            message: z.string({
                required_error: 'Message content is required',
            }),
        }).strict(),
    }),

    updateMessage: z.object({
        body: z.object({
            message: z.string({
                required_error: 'Message content is required',
            }),
        }).strict(),
    }),
};
