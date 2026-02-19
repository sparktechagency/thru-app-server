"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentValidations = void 0;
const zod_1 = require("zod");
exports.CommentValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            postId: zod_1.z.string({
                required_error: 'Post ID is required'
            }),
            content: zod_1.z.string({
                required_error: 'Content is required',
            }),
        }),
    }),
};
