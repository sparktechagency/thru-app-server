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
  const { image, ...userData } = req.body
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
  const paginationOptions = pick(req.query, paginationFields)
  const filterOptions = pick(req.query, user_filterable_fields)
  const { user } = req
  const result = await UserServices.getUsers(user!, filterOptions, paginationOptions)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Workers retrieved successfully',
    data: result,
  })
})

export const UserController = {
  uploadImages,
  updateProfile,
  getUserProfile,
  getUsers
}
