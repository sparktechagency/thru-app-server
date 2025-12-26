import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IActivityFilterables, IActivity } from './activity.interface';
import { Activity } from './activity.model';
import { JwtPayload } from 'jsonwebtoken';
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

    const plan = await Plan.findById(planId).session(session);
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, "The requested plan was not found.");
    }

    // Handle activity from serpApi (externalId)
    let activity = await Activity.findOne({ externalId: payload.externalId }).session(session);

    if (!activity) {
      const [newActivity] = await Activity.create([payload], { session });
      activity = newActivity;
    }

    // Link the activity to the plan if not already linked (push the id)
    if (!plan.activities.some(id => id.equals(activity._id))) {
      await Plan.findByIdAndUpdate(
        planId,
        { $push: { activities: activity._id } },
        { session }
      );
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

export const removeActivityFromPlan = async (
  planId: string,
  activityId: string
) => {
  if (!Types.ObjectId.isValid(planId) || !Types.ObjectId.isValid(activityId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan or Activity ID');
  }

  const result = await Plan.findByIdAndUpdate(
    planId,
    { $pull: { activities: activityId } },
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
          createdBy: user.authId,
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
  updateActivity,
  deleteActivity,
  addActivityToExistingPlan,
  removeActivityFromPlan,
  createPlanWithActivity
};