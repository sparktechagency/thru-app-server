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

//* for updating user profile
router.patch(
  '/profile',
  auth(
    USER_ROLES.USER,
    USER_ROLES.ADMIN,
  ),

  validateRequest(UserValidations.updateUserZodSchema),
  UserController.updateProfile,
)

//* for uploading images for user
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

//* get user profile
router.get(
  '/profile',
  auth(

    USER_ROLES.ADMIN,
    USER_ROLES.USER,


  ),
  UserController.getUserProfile,
)


router.get("/", auth(USER_ROLES.USER, USER_ROLES.ADMIN), UserController.getUsers)
export const UserRoutes = router
