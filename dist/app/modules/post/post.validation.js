"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostValidations = void 0;
const zod_1 = require("zod");
exports.PostValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string({
                required_error: 'Title is required',
            }),
            image: zod_1.z.string().optional(),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string().optional(),
            image: zod_1.z.string().optional(),
        }),
    }),
};
