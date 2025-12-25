import { Request, Response } from 'express';
import { ActivityServices } from './activity.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { activityFilterables } from './activity.constants';
import { paginationFields } from '../../../interfaces/pagination';

const createActivity = catchAsync(async (req: Request, res: Response) => {
  const { images, media, ...activityData } = req.body;
  
  if (images && images.length > 0) {
    activityData.images = images;
  }
  
  if (media && media.length > 0) {
    activityData.media = media;
  }

  const result = await ActivityServices.createActivity(
    req.user!,
    activityData
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Activity created successfully',
    data: result,
  });
});

const updateActivity = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const activityData = req.body;

  const result = await ActivityServices.updateActivity(id, activityData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Activity updated successfully',
    data: result,
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

const getAllActivitys = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, activityFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await ActivityServices.getAllActivitys(
    req.user!,
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Activitys retrieved successfully',
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
  updateActivity,
  getSingleActivity,
  getAllActivitys,
  deleteActivity,
};