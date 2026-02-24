import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IUser, IUserFilterableFields } from './user.interface'
import { User } from './user.model'
import { Plan } from '../plan/plan.model'
import { Types } from 'mongoose'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'
import { JwtPayload } from 'jsonwebtoken'
import { logger } from '../../../shared/logger'
import config from '../../../config'
import { ImageUploadPayload } from '../../../shared/shared'
import removeFile from '../../../helpers/image/remove'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { user_searchable_fields } from './user.constants'
import { Friend } from '../friend/friend.model'
import { FriendServices } from '../friend/friend.service'
import { Request } from '../request/request.model'
import { REQUEST_TYPE, REQUEST_STATUS } from '../request/request.interface'

import QueryBuilder from '../../builder/QueryBuilder';

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

  // Calculate total duration using MongoDB aggregation for better performance
  const aggregationResult = await Plan.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              { createdBy: new Types.ObjectId(user.authId) },
              { collaborators: new Types.ObjectId(user.authId) },
            ],
          },
          {
            endDate: { $lt: new Date() },
          },
          {
            date: { $exists: true, $ne: null },
          },
          {
            endDate: { $exists: true, $ne: null },
          },
        ],
      },
    },
    {
      $project: {
        durationMs: { $subtract: ['$endDate', '$date'] },
      },
    },
    {
      $group: {
        _id: null,
        totalDurationMs: { $sum: '$durationMs' },
      },
    },
  ])

  const totalDurationMs = aggregationResult.length > 0 ? aggregationResult[0].totalDurationMs : 0

  const totalDaysCount = Math.floor(totalDurationMs / (1000 * 60 * 60 * 24))
  const months = Math.floor(totalDaysCount / 30)
  const days = totalDaysCount % 30

  let formattedTotalDays = ''
  if (months > 0) {
    formattedTotalDays += `${months} Month${months > 1 ? 's' : ''} `
  }
  formattedTotalDays += `${days} Day${days !== 1 ? 's' : ''}`

  const updatedUser = await User.findByIdAndUpdate(
    user.authId,
    { $set: { totalDays: formattedTotalDays.trim() } },
    { new: true },
  )

  return updatedUser
}



const getUsers = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const { latitude, longitude, radius } = query;

  // Base query with mandatory conditions
  let baseQuery = User.find({
    role: USER_ROLES.USER,
    verified: true
  });

  // Handle geospatial search if coordinates are provided
  if (latitude && longitude && radius) {
    baseQuery = baseQuery.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude) || 0, Number(latitude) || 0],
          },
          $maxDistance: Number(radius) || 10000,
        },
      },
    });
  }

  const selectFields =
    user.role === USER_ROLES.USER ? '-location -verified -role -createdAt -updatedAt' : '';

  const userQuery = new QueryBuilder(baseQuery, query)
    .search(user_searchable_fields)
    .filter()
    .sort()
    .paginate();

  if (selectFields) {
    userQuery.modelQuery = userQuery.modelQuery.select(selectFields);
  }

  const [result, friendList, friendRequests] = await Promise.all([
    userQuery.modelQuery,
    FriendServices.getMyFriendList(user, { planId: null }),
    Request.find({
      $or: [
        { requestedBy: user.authId },
        { requestedTo: user.authId }
      ],
      type: REQUEST_TYPE.FRIEND,
      status: REQUEST_STATUS.PENDING
    })
  ]);

  const friendIdSet = new Set(friendList.map(friend => friend?._id.toString()));

  const sentRequestsSet = new Set(
    friendRequests
      .filter(req => req.requestedBy.toString() === user.authId)
      .map(req => req.requestedTo.toString())
  );

  const receivedRequestsSet = new Set(
    friendRequests
      .filter(req => req.requestedTo.toString() === user.authId)
      .map(req => req.requestedBy.toString())
  );

  const usersWithFriendFlag = result.map(userDoc => {
    const userObj = userDoc.toObject ? userDoc.toObject() : userDoc;
    const userId = userObj._id.toString();

    let friendStatus = 'none';
    if (friendIdSet.has(userId)) {
      friendStatus = 'friend';
    } else if (sentRequestsSet.has(userId)) {
      friendStatus = 'request_sent';
    } else if (receivedRequestsSet.has(userId)) {
      friendStatus = 'request_received';
    }

    return {
      ...userObj,
      friendStatus,
    };
  });

  const meta = await userQuery.getPaginationInfo();

  return {
    data: usersWithFriendFlag,
    meta,
  };
};






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
