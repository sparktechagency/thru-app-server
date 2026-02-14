import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import {  IActivity } from './activity.interface';
import { Activity } from './activity.model';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import removeFile from '../../../helpers/image/remove';
import { activitySearchableFields } from './activity.constants';
import QueryBuilder from '../../builder/QueryBuilder';
import { Plan } from '../plan/plan.model';

const createActivity = async (
  user: JwtPayload,
  payload: IActivity
): Promise<IActivity> => {
  try {
    payload.createdBy = user.authId;
    const isPlanExist = await Plan.findById(payload.planId);
    if (!isPlanExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid planId, please try again with valid planId');
    }
    const result = await Activity.create(payload);
    if (!result) {
      if (payload.images && payload.images.length > 0) {
        removeFile(payload.images);
      }
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Activity, please try again with valid data.'
      );
    }
    return result;
  } catch (error: any) {
    if (payload.images && payload.images.length > 0) {
      removeFile(payload.images);
    }
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

const getAllActivities = async (user: JwtPayload, query: Record<string, unknown>) => {
  if (!query.category || !query.planId){
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Category and planId are required to fetch activities');
  }
  const activityQuery = new QueryBuilder(Activity.find(), query)
    .search(activitySearchableFields)
    .filter()
    .sort()
    .fields();

  const result = await activityQuery.modelQuery;

  return {
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

  if (result.images && result.images.length > 0) {
    removeFile(result.images);
  }

  return result;
};

export const ActivityServices = {
  createActivity,
  getAllActivities,
  getSingleActivity,
  updateActivity,
  deleteActivity,
};