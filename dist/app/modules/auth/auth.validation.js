"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidations = void 0;
const zod_1 = require("zod");
const verification_interface_1 = require("../verification/verification.interface");
const verifyAccountZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .optional()
            .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
            message: 'Invalid email format',
        }),
        type: zod_1.z.nativeEnum(verification_interface_1.VERIFICATION_TYPE, { required_error: "Verification type is requried." }),
        oneTimeCode: zod_1.z.string().min(1, { message: 'OTP is required' }),
    }).strict(),
});
const forgetPasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: 'Invalid email format.' }),
        phone: zod_1.z
            .string()
            .optional()
            .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
            message: 'Invalid phone number format',
        }),
    }),
});
const resetPasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        newPassword: zod_1.z.string().min(8, { message: 'Password is required' }),
        confirmPassword: zod_1.z
            .string()
            .min(8, { message: 'Confirm Password is required' }),
    }),
});
const loginZodSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        email: zod_1.z.string().email({ message: 'Invalid email format.' }),
        phone: zod_1.z
            .string()
            .optional()
            .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
            message: 'Invalid phone number format',
        }),
        fcmToken: zod_1.z.string().min(1).optional(),
        password: zod_1.z.string().min(6, { message: "Password is required, and must be 6 character long." }),
    })
        .strict(),
});
const resendOtpZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .optional()
            .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
            message: 'Invalid email format',
        }),
        phone: zod_1.z
            .string()
            .optional()
            .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
            message: 'Invalid phone number format',
        }),
        type: zod_1.z.nativeEnum(verification_interface_1.VERIFICATION_TYPE, { required_error: "Verification type is requried." }),
    }),
});
const changePasswordZodSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        currentPassword: zod_1.z.string({
            required_error: 'Current password is required',
        }),
        newPassword: zod_1.z
            .string({
            required_error: 'New password is required',
        })
            .min(8, 'Password must be at least 8 characters'),
        confirmPassword: zod_1.z.string({
            required_error: 'Confirm password is required',
        }),
    })
        .refine(data => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }),
});
const deleteAccount = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
    }),
});
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        email: zod_1.z
            .string({ required_error: 'Email is required' })
            .email({ message: 'Invalid email format' }),
        password: zod_1.z
            .string({ required_error: 'Password is required' })
            .min(6, { message: 'Password must be at least 6 characters' })
            .max(20, { message: 'Password must be at most 20 characters' })
            .regex(/^(?=.*[A-Za-z])(?=.*\d)/, {
            message: 'Password must contain at least one letter and one number',
        }),
        name: zod_1.z.string({ required_error: 'Name is required' }),
        phone: zod_1.z.string({ required_error: 'Phone is required' }).optional(),
    })
        .strict(),
});
const socialLoginZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        appId: zod_1.z.string({ required_error: 'App ID is required' }),
        fcmToken: zod_1.z.string({ required_error: 'Device token is required' }),
    }),
});
exports.AuthValidations = {
    verifyAccountZodSchema,
    forgetPasswordZodSchema,
    resetPasswordZodSchema,
    loginZodSchema,
    resendOtpZodSchema,
    changePasswordZodSchema,
    createUserZodSchema,
    deleteAccount,
    socialLoginZodSchema,
};
