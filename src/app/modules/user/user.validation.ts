import { z } from 'zod'
import { USER_ROLES } from '../../../enum/user'


const createUserZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required and must be 6 character long.' }).min(6),
    name: z.string({ required_error: 'Name is required' }),
    lastName: z.string({ required_error: 'Last name is required' }),
    role: z.enum(
      [
        USER_ROLES.USER,
      ],
      {
        message: 'Role must be user',
      },
    ),
  }).strict(),
})

const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().optional(),

  }),
})

const uploadImagesZodSchema = z.object({
  body: z.object({
    images: z.array(z.string()),
    type: z.enum(['cover', 'profile']),
  }),
})

export const UserValidations = { createUserZodSchema, updateUserZodSchema, uploadImagesZodSchema }
