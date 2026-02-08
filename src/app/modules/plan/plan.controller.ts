import { Request, Response } from 'express';
import { PlanServices } from './plan.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { planFilterables } from './plan.constants';
import { paginationFields } from '../../../interfaces/pagination';

const createPlan = catchAsync(async (req: Request, res: Response) => {
  const planData = req.body;
  const result = await PlanServices.createPlan(
    req.user!,
    planData
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Plan created successfully',
    data: result,
  });
});

const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const planData = req.body;

  const result = await PlanServices.updatePlan(id, planData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plan updated successfully',
    data: result,
  });
});

const getSinglePlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PlanServices.getSinglePlan(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plan retrieved successfully',
    data: result,
  });
});


const getAllPlansFromDb = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, planFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await PlanServices.getAllPlansFromDb(
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plans retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});


const getAllPlans = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, planFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await PlanServices.getAllPlans(
    req.user!,
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plans retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const deletePlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PlanServices.deletePlan(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plan deleted successfully',
    data: result,
  });
});


const removePlanFriend = catchAsync(async (req: Request, res: Response) => {
  const { planId, userId } = req.body;
  const result = await PlanServices.removePlanFriend(planId, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Friend removed from plan successfully',
    data: result,
  });
});

const getPlansByStartTime = catchAsync(async (req: Request, res: Response) => {
  const pagination = pick(req.query, paginationFields);

  const result = await PlanServices.getPlansByStartTime(req.user!, pagination);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Upcoming plans retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const searchPlaces = catchAsync(async (req: Request, res: Response) => {
  const query = pick(req.query, ['searchTerm', 'location', 'address', 'category', 'dateFilter', 'startDate', 'endDate']);
  const result = await PlanServices.searchPlaces(query as any);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Places searched successfully',
    data: result,
  });
});

export const PlanController = {
  createPlan,
  updatePlan,
  getSinglePlan,
  getAllPlans,
  deletePlan,
  removePlanFriend,
  getPlansByStartTime,
  searchPlaces,
  getAllPlansFromDb
};