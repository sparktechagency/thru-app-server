import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IUser } from './user.interface'
import { User } from './user.model'

import { USER_ROLES, USER_STATUS } from '../../../enum/user'

import { JwtPayload } from 'jsonwebtoken'
import { logger } from '../../../shared/logger'
import config from '../../../config'
import { ImageUploadPayload } from '../../../shared/shared'
import removeFile from '../../../helpers/image/remove'



const updateProfile = async (user: JwtPayload, payload: Partial<IUser>) => {
  const updatedProfile = await User.findOneAndUpdate(
    { _id: user.authId, status: { $nin: [USER_STATUS.DELETED] } },
    {
      $set: payload,
    },
    { new: false },
  )

  if (!updatedProfile) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update profile.')
  }

  return 'Profile updated successfully.'
}

const createAdmin = async (): Promise<Partial<IUser> | null> => {
  const admin = {
    email: config.admin.email,
    name: 'Admin',
    password: config.admin.password,
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    verified: true,
    authentication: {
      oneTimeCode: null,
      restrictionLeftAt: null,
      expiresAt: null,
      latestRequestAt: new Date(),
      authType: '',
    },
  }

  const isAdminExist = await User.findOne({
    email: admin.email,
    status: { $nin: [USER_STATUS.DELETED] },
  })

  if (isAdminExist) {
    logger.log('info', 'Admin account already exist, skipping creation.🦥')
    return isAdminExist
  }
  const result = await User.create([admin])
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin')
  }
  return result[0]
}

const uploadImages = async (user: JwtPayload, payload: ImageUploadPayload) => {
  const { authId } = user
  const userExist = await User.findById(authId)
  if (!userExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'The requested user not found.')
  }
  const { images, type } = payload
  if (type === 'cover') {
    userExist.cover = images[0]
  } else if (type === 'profile') {
    userExist.profile = images[0]
  }
  const updatedUser = await User.findByIdAndUpdate(authId, userExist, {
    new: false,
  })
  if (!updatedUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Failed to upload ${type} image. Please try again.`,
    )
  }

  if (updatedUser[type]) {
    await removeFile(updatedUser[type])
  }

  return 'Images uploaded successfully.'
}

export const UserServices = { updateProfile, createAdmin, uploadImages }
