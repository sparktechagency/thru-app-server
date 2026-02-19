"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityValidations = void 0;
const zod_1 = require("zod");
exports.ActivityValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string({
                required_error: 'Title is required',
            }),
            planId: zod_1.z.string(),
            category: zod_1.z.enum(["eatAndDrink", "stays", "transportation", "custom", "activity"], {
                required_error: 'Category is required',
            }),
            description: zod_1.z.string().optional(),
            address: zod_1.z.string({
                required_error: 'Address is required',
            }),
            date: zod_1.z.string({
                required_error: 'Date is required',
            }).datetime(),
            link: zod_1.z.string().optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(),
        }).strict(),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string().optional(),
            category: zod_1.z.enum(["eatAndDrink", "stays", "transportation", "custom", "activity"]).optional(),
            description: zod_1.z.string().optional(),
            address: zod_1.z.string().optional(),
            date: zod_1.z.string().datetime().optional(),
            link: zod_1.z.string().optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(),
        }).strict(),
    }),
};
