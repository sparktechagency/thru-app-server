"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanValidations = void 0;
const zod_1 = require("zod");
exports.PlanValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string({
                required_error: 'Title is required',
            }),
            description: zod_1.z.string().optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(),
            date: zod_1.z.string({
                required_error: 'Date is required',
            }).datetime(),
            endDate: zod_1.z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
                message: 'Invalid endDate'
            }),
            address: zod_1.z.string({
                required_error: 'Address is required',
            }),
            collaborators: zod_1.z.array(zod_1.z.string()).optional(),
        }).strict(),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(),
            date: zod_1.z.string().datetime().optional(),
            endDate: zod_1.z.string().datetime().optional(),
            address: zod_1.z.string().optional(),
            collaborators: zod_1.z.array(zod_1.z.string()).optional(),
        }).strict(),
    }),
    addCollaborator: zod_1.z.object({
        body: zod_1.z.object({
            planId: zod_1.z.string({
                required_error: 'Plan ID is required'
            }),
            userId: zod_1.z.string({
                required_error: 'User ID is required'
            })
        }).strict(),
    }),
    removeCollaborator: zod_1.z.object({
        body: zod_1.z.object({
            planId: zod_1.z.string({
                required_error: 'Plan ID is required'
            }),
            userId: zod_1.z.string({
                required_error: 'User ID is required'
            })
        }).strict(),
    }),
};
