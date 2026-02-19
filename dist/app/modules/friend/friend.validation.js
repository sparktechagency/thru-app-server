"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendValidations = void 0;
const zod_1 = require("zod");
exports.FriendValidations = {
    create: zod_1.z.object({
        users: zod_1.z.array(zod_1.z.string()),
        requestId: zod_1.z.string(),
    }),
    update: zod_1.z.object({
        users: zod_1.z.array(zod_1.z.string()).optional(),
        requestId: zod_1.z.string().optional(),
    }),
};
