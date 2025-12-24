import { Request, Response, NextFunction } from 'express'

import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'

import { UserServices } from './user.service'
import { ImageUploadPayload } from '../../../shared/shared'





const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { image, ...userData } = req.body
  const result = await UserServices.updateProfile(req.user!, userData)
  sendResponse<String>(res, {
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

export const UserController = {
  uploadImages,
  updateProfile,
}
