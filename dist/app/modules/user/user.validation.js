"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidations = void 0;
const zod_1 = require("zod");
const user_1 = require("../../../enum/user");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: 'Email is required' }).email(),
        password: zod_1.z.string({ required_error: 'Password is required and must be 6 character long.' }).min(6),
        name: zod_1.z.string({ required_error: 'Name is required' }),
        lastName: zod_1.z.string({ required_error: 'Last name is required' }),
        role: zod_1.z.enum([
            user_1.USER_ROLES.USER,
        ], {
            message: 'Role must be user',
        }),
    }).strict(),
});
const updateUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        bio: zod_1.z.string().optional(),
        longitude: zod_1.z.number().optional(),
        latitude: zod_1.z.number().optional(),
        profilePicture: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
    }),
});
const uploadImagesZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        images: zod_1.z.array(zod_1.z.string()),
        type: zod_1.z.enum(['cover', 'profile']),
    }),
});
exports.UserValidations = { createUserZodSchema, updateUserZodSchema, uploadImagesZodSchema };
