import { Request, Response } from 'express';
import { PlanServices } from './plan.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

const createPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanServices.createPlan(req.user!, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Plan created successfully',
    data: result,
  });
});

const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PlanServices.updatePlan(id, req.body);

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

const getAllPlans = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanServices.getAllPlans(req.user!, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Plans retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getHistoryPlans = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanServices.getHistoryPlans(req.user!, req.query);    

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'My created plans retrieved successfully',
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

const addPlanCollaborator = catchAsync(async (req: Request, res: Response) => {
  const { planId, userId } = req.body;
  const result = await PlanServices.addPlanCollaborator(planId, userId, (req.user as JwtPayload).authId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collaborator added to plan successfully',
    data: result,
  });
});

const removePlanCollaborator = catchAsync(async (req: Request, res: Response) => {
  const { planId, userId } = req.body;
  const result = await PlanServices.removePlanCollaborator(planId, userId, (req.user as JwtPayload).authId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Collaborator removed from plan successfully',
    data: result,
  });
});

export const PlanController = {
  createPlan,
  updatePlan,
  getSinglePlan,
  getAllPlans,
  deletePlan,
  addPlanCollaborator,
  removePlanCollaborator,
  getHistoryPlans
};
