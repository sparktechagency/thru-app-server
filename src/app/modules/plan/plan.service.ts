import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPlanFilterables, IPlan } from './plan.interface';
import { Plan } from './plan.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { planSearchableFields } from './plan.constants';
import { Types } from 'mongoose';
import removeFile from '../../../helpers/image/remove';

type createPlan = IPlan & {
  latitude?: number
  longitude?: number
}

const createPlan = async (
  user: JwtPayload,
  payload: createPlan
): Promise<IPlan> => {
  try {

    if (
      typeof payload.latitude === 'number' &&
      typeof payload.longitude === 'number'
    ) {
      payload.location = {
        type: 'Point',
        coordinates: [payload.longitude, payload.latitude],
      }
    }

    payload.createdBy = user.authId

    const result = await Plan.create(payload);
    if (!result) {
      if (payload.images) { removeFile(payload.images) }

      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Plan, please try again with valid data.'
      );
    }

    return result;
  } catch (error: any) {
    if (payload.images) { removeFile(payload.images) }

    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

const getAllPlans = async (
  user: JwtPayload,
  filterables: IPlanFilterables,
  pagination: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = filterables;
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const andConditions = [];

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: planSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {};

  const [result, total] = await Promise.all([
    Plan
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }).populate('activities').populate('friends'),
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

const getSinglePlan = async (id: string): Promise<IPlan> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const result = await Plan.findById(id).populate('activities').populate('friends');
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested plan not found, please try again with valid id'
    );
  }

  return result;
};

const updatePlan = async (
  id: string,
  payload: Partial<IPlan>
): Promise<IPlan | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const result = await Plan.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  ).populate('activities').populate('friends');

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested plan not found, please try again with valid id'
    );
  }

  return result;
};

const deletePlan = async (id: string): Promise<IPlan> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const result = await Plan.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting plan, please try again with valid id.'
    );
  }

  // Remove associated files
  if (result.images) {
    removeFile(result.images);
  }

  return result;
};


const removePlanFriend = async (planId: string, userId: string): Promise<IPlan | null> => {
  if (!Types.ObjectId.isValid(planId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const result = await Plan.findByIdAndUpdate(
    planId,
    { $pull: { friends: userId } },
    { new: true, runValidators: true }
  ).populate('activities').populate('friends');

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested plan not found'
    );
  }

  return result;
};

export const PlanServices = {
  createPlan,
  getAllPlans,
  getSinglePlan,
  updatePlan,
  deletePlan,
  removePlanFriend
};