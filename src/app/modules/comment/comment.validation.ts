import { z } from 'zod';
import { Types } from 'mongoose';

export const CommentValidations = {
    create: z.object({
        body: z.object({
            postId: z.string({
                required_error: 'Post ID is required'
            }),
            content: z.string({
                required_error: 'Content is required',
            }),
        }),
    }),
};
