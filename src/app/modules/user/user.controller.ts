import { Request, Response, NextFunction } from 'express'

import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'

import { UserServices } from './user.service'
import { ImageUploadPayload } from '../../../shared/shared'
import pick from '../../../shared/pick'
import { user_filterable_fields } from './user.constants'
import { paginationFields } from '../../../interfaces/pagination'
import { IUser } from './user.interface'





const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { profilePicture, image, ...userData } = req.body

  if (profilePicture) {
    userData.profile = profilePicture
  } else if (image) {
    userData.profile = image
  }

  const result = await UserServices.updateProfile(req.user!, userData)
  sendResponse<IUser>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  })
})

const uploadImages = catchAsync(async (req: Request, res: Response) => {
  const { images, type } = req.body as ImageUploadPayload
  const result = await UserServices.uploadImages(req.user!, { images, type })
  sendResponse<String>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Images uploaded successfully',
    data: result,
  })
})

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUserProfile(req.user!)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
  })
})


const getUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUsers(req.user!, req.query)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result.data,
    meta: result.meta,
  })
})

const getUserActivityLog = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pick(req.query, paginationFields)
  const result = await UserServices.getUserActivityLog(req.user!, paginationOptions)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User activity log retrieved successfully',
    meta: result.meta,
    data: result.data,
  })
})

export const UserController = {
  uploadImages,
  updateProfile,
  getUserProfile,
  getUsers,
  getUserActivityLog
}
