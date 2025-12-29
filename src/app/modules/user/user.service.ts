import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IUser, IUserFilterableFields } from './user.interface'
import { User } from './user.model'
import { Plan } from '../plan/plan.model'

import { USER_ROLES, USER_STATUS } from '../../../enum/user'

import { JwtPayload } from 'jsonwebtoken'
import { logger } from '../../../shared/logger'
import config from '../../../config'
import { ImageUploadPayload } from '../../../shared/shared'
import removeFile from '../../../helpers/image/remove'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { user_searchable_fields } from './user.constants'


type UpdateProfile = IUser & {
  latitude?: number
  longitude?: number
}


const updateProfile = async (user: JwtPayload, payload: Partial<UpdateProfile>): Promise<IUser> => {

  if (
    typeof payload.latitude === 'number' &&
    typeof payload.longitude === 'number'
  ) {
    payload.location = {
      type: 'Point',
      coordinates: [payload.longitude, payload.latitude], // lng, lat
    }
  }

  const updatedProfile = await User.findOneAndUpdate(
    { _id: user.authId, status: { $nin: [USER_STATUS.DELETED] } },
    {
      $set: payload,
    },
    { new: true },
  )

  if (!updatedProfile) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update profile.')
  }

  return updatedProfile
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

const getUserProfile = async (user: JwtPayload) => {
  const isUserExist = await User.findById(user.authId)
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'The requested user not found.')
  }
  return isUserExist
}


const getUsers = async (
  user: JwtPayload,
  filters: IUserFilterableFields,
  paginationOptions: IPaginationOptions,
) => {
  const {
    searchTerm,
    latitude,
    longitude,
    radius,
    ...filterData
  } = filters
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions)
  const andConditions = []


  if (latitude && longitude && radius) {
    andConditions.push({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude) || 0, Number(latitude) || 0],
          },
          $maxDistance: Number(radius) || 10000, //10km max
        },
      },
    })
  }

  if (searchTerm) {
    andConditions.push({
      $or: user_searchable_fields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })
  }
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    })
  }
  andConditions.push({
    role: USER_ROLES.USER,
    verified: true
  })
  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {}

  const selectFields =
    user.role === USER_ROLES.USER ? '-location -verified -role -createdAt -updatedAt' : '';

  const [result, total] = await Promise.all([
    User.find(whereConditions)
      .select(selectFields)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(whereConditions),
  ])

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  }
}






const getUserActivityLog = async (
  user: JwtPayload,
  pagination: IPaginationOptions
) => {
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const now = new Date();
  const whereConditions = {
    $and: [
      {
        $or: [
          { createdBy: user.authId },
          { friends: user.authId }
        ]
      },
      { date: { $lt: now } }
    ]
  };

  const [result, total] = await Promise.all([
    Plan.find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate('activities')
      .populate('friends'),
    Plan.countDocuments(whereConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

export const UserServices = { updateProfile, createAdmin, uploadImages, getUserProfile, getUsers, getUserActivityLog }
