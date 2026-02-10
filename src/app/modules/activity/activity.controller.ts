import { Request, Response } from 'express';
import { ActivityServices } from './activity.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { activityFilterables } from './activity.constants';
import { paginationFields } from '../../../interfaces/pagination';

const createActivity = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityServices.createActivity(
    req.user!,
    req.body
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Activity created successfully',
    data: result,
  });
});

const getAllActivities = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityServices.getAllActivities(req.user!, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Activities retrieved successfully',
    data: result.data,
  });
});

const getSingleActivity = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ActivityServices.getSingleActivity(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Activity retrieved successfully',
    data: result,
  });
});

const updateActivity = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ActivityServices.updateActivity(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Activity updated successfully',
    data: result,
  });
});

const deleteActivity = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ActivityServices.deleteActivity(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Activity deleted successfully',
    data: result,
  });
});

export const ActivityController = {
  createActivity,
  getAllActivities,
  getSingleActivity,
  updateActivity,
  deleteActivity,
};