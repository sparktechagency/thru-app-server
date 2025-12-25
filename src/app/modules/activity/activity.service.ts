import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IActivityFilterables, IActivity } from './activity.interface';
import { Activity } from './activity.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { activitySearchableFields } from './activity.constants';
import mongoose, { Types } from 'mongoose';
import removeFile from '../../../helpers/image/remove';
import { Plan } from '../plan/plan.model';


const createActivity = async (
  user: JwtPayload,
  payload: IActivity
): Promise<IActivity> => {
  try {
    const result = await Activity.create(payload);
    if (!result) {
      removeFile(payload.images);
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Activity, please try again with valid data.'
      );
    }

    return result;
  } catch (error: any) {
    if (payload.images) removeFile(payload.images);
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

const getAllActivitys = async (
  user: JwtPayload,
  filterables: IActivityFilterables,
  pagination: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = filterables;
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const andConditions = [];

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: activitySearchableFields.map((field) => ({
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
    Activity
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }),
    Activity.countDocuments(whereConditions),
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

const getSingleActivity = async (id: string): Promise<IActivity> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Activity ID');
  }

  const result = await Activity.findById(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested activity not found, please try again with valid id'
    );
  }

  return result;
};

const updateActivity = async (
  id: string,
  payload: Partial<IActivity>
): Promise<IActivity | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Activity ID');
  }

  const result = await Activity.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested activity not found, please try again with valid id'
    );
  }

  return result;
};

const deleteActivity = async (id: string): Promise<IActivity> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Activity ID');
  }

  const result = await Activity.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting activity, please try again with valid id.'
    );
  }

  // Remove associated files
  if (result.images) {
    removeFile(result.images);
  }

  return result;
};


export const addActivityToExistingPlan = async (
  user: JwtPayload,
  payload: IActivity,
  planId?: string
) => {
  if (!planId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Plan ID is required.");
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();


    const plan = await Plan.findById(new Types.ObjectId(planId)).session(session);
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, "The requested plan was not found.");
    }

    let activity = await Activity.findOne({ externalId: payload.externalId }).session(session);


    if (!activity) {
      const [newActivity] = await Activity.create([payload], { session });
      activity = newActivity;
    }

    // Link the activity to the plan if not already linked
    if (!plan.activities.includes(activity._id)) {
      plan.activities.push(activity._id);
      await plan.save({ session });
    }

    await session.commitTransaction();
    return activity;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


export const createPlanWithActivity = async (
  user: JwtPayload,
  payload: IActivity
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Check if activity already exists
    let activity = await Activity.findOne({ externalId: payload.externalId }).session(session);

    if (!activity) {
      const [newActivity] = await Activity.create([payload], { session });
      activity = newActivity;
    }

    // Create plan with the activity
    const [plan] = await Plan.create(
      [
        {
          createdBy: user.id,
          title: activity.title,
          description: activity.description,
          date: activity.date || new Date(),
          activities: [activity._id],
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { plan, activity };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const ActivityServices = {
  createActivity,
  getAllActivitys,
  getSingleActivity,
  updateActivity,
  deleteActivity,
  addActivityToExistingPlan
};