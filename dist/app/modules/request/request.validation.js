"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidations = void 0;
const zod_1 = require("zod");
const request_interface_1 = require("./request.interface");
const mongoose_1 = require("mongoose");
exports.RequestValidations = {
    create: zod_1.z.object({
        params: zod_1.z.object({
            requestedTo: zod_1.z.string(),
        })
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            status: zod_1.z.nativeEnum(request_interface_1.REQUEST_STATUS).optional()
        }),
        params: zod_1.z.object({
            id: zod_1.z.string().refine((value) => mongoose_1.Types.ObjectId.isValid(value), 'Invalid request id')
        })
    }),
    createPlanRequest: zod_1.z.object({
        body: zod_1.z.object({
            requestedTo: zod_1.z.string(),
            planId: zod_1.z.string()
        })
    }),
};
