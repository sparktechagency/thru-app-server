"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageValidations = void 0;
const zod_1 = require("zod");
exports.MessageValidations = {
    sendMessage: zod_1.z.object({
        body: zod_1.z.object({
            message: zod_1.z.string({
                required_error: 'Message content is required',
            }).optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(),
        }).strict(),
    }),
    updateMessage: zod_1.z.object({
        body: zod_1.z.object({
            message: zod_1.z.string({
                required_error: 'Message content is required',
            }),
            images: zod_1.z.array(zod_1.z.string()).optional(),
        }).strict(),
    }),
};
