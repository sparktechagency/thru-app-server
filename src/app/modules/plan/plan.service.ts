import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPlan } from './plan.interface';
import { Plan } from './plan.model';
import { JwtPayload } from 'jsonwebtoken';
import { planSearchableFields } from './plan.constants';
import { Types } from 'mongoose';
import removeFile from '../../../helpers/image/remove';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';



const createPlan = async (
  user: JwtPayload,
  payload: IPlan
): Promise<IPlan> => {
  try {
    payload.createdBy = user.authId;
    payload.collaborators = [user.authId];

    const result = await Plan.create(payload);
    if (!result) {
      if (payload.images && payload.images.length > 0) {
        removeFile(payload.images);
      }

      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Plan, please try again with valid data.'
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


const getAllPlans = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const planQuery = new QueryBuilder(
    Plan.find({
      $or: [{ createdBy: user.authId }, { collaborators: user.authId }],
    }),
    query
  )
    .search(planSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await planQuery.modelQuery
    .populate('createdBy', 'name lastName profile')
    .populate('collaborators', 'name lastName profile')


  const meta = await planQuery.getPaginationInfo();

  return {
    meta,
    data: result,
  };
};

const getHistoryPlans = async (
  user: JwtPayload,
  query: Record<string, unknown>  ) => {

  const currentDate = new Date();

  const planQuery = new QueryBuilder(
   Plan.find({
    $and: [
      {
        $or: [{ createdBy: user.authId }, { collaborators: user.authId }]
      },
      {
        endDate: { $lt: currentDate }
      }
    ]
  }),
    query
  ) .search(planSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();  
    
  const result = await planQuery.modelQuery
    .populate('createdBy', 'name lastName profile')
    .populate('collaborators', 'name lastName profile')

  const meta = await planQuery.getPaginationInfo();

  return {  data: result, meta };
}

const getSinglePlan = async (id: string): Promise<IPlan> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const result = await Plan.findById(id)
    .populate('createdBy', 'name lastName fullName profile')
    .populate('collaborators', 'name lastName fullName profile')

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
  )
    .populate('createdBy', 'name lastName fullName profile')
    .populate('collaborators', 'name lastName fullName profile')

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
  if (result.images && result.images.length > 0) {
    removeFile(result.images);
  }

  return result;
};

const addPlanCollaborator = async (planId: string, userId: string, requesterId: string): Promise<IPlan | null> => {
  if (!Types.ObjectId.isValid(planId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const session = await Plan.startSession();

  try {
    session.startTransaction();

    const plan = await Plan.findById(planId).session(session);
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Requested plan not found');
    }


    const result = await Plan.findByIdAndUpdate(
      planId,
      { $addToSet: { collaborators: userId } },
      { new: true, runValidators: true, session }
    );

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Requested plan not found');
    }

    const planIncludedInUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { includedPlans: planId } },
      { new: true, runValidators: true, session }
    );

    if (!planIncludedInUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Requested user not found to include plan');
    }

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const removePlanCollaborator = async (planId: string, userId: string, requesterId: string): Promise<IPlan | null> => {
  if (!Types.ObjectId.isValid(planId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
  }

  const session = await Plan.startSession();

  try {
    session.startTransaction();

    const plan = await Plan.findById(planId).session(session);
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Requested plan not found');
    }

    const result = await Plan.findByIdAndUpdate(
      planId,
      { $pull: { collaborators: userId } },
      { new: true, runValidators: true, session }
    );

    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Requested plan not found');
    }

    const planRemovedFromUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { includedPlans: planId } },
      { new: true, runValidators: true, session }
    );

    if (!planRemovedFromUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Requested user not found to remove plan');
    }

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const PlanServices = {
  createPlan,
  getAllPlans,
  getSinglePlan,
  updatePlan,
  deletePlan,
  addPlanCollaborator,
  removePlanCollaborator,
  getHistoryPlans
};