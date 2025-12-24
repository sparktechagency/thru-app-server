import express from 'express'
import { UserController } from './user.controller'
import { UserValidations } from './user.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import {
  fileAndBodyProcessorUsingDiskStorage,
} from '../../middleware/processReqBody'

const router = express.Router()


router.patch(
  '/profile',
  auth(
    USER_ROLES.USER,
    USER_ROLES.ADMIN,
  ),

  validateRequest(UserValidations.updateUserZodSchema),
  UserController.updateProfile,
)


router.post(
  '/upload-images',
  auth(
    USER_ROLES.USER,
    USER_ROLES.ADMIN,

  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(UserValidations.uploadImagesZodSchema),
  UserController.uploadImages,
)

export const UserRoutes = router
