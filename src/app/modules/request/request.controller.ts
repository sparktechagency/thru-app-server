import { Request, Response } from 'express';

import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { requestFilterables } from './request.constants';
import { paginationFields } from '../../../interfaces/pagination';
import { RequestService } from './request.service';

const createRequest = catchAsync(async (req: Request, res: Response) => {
  const requestData = req.body;

  const result = await RequestService.sendFriendRequest(
    req.user!,
    requestData
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Request sent successfully',
    data: result,
  });
});

const updateRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const requestData = req.body;

  const result = await RequestService.acceptOrRejectRequest(req.user!, requestData, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Request status updated successfully',
    data: result,
  });
});

const getMyFreindRequestList = catchAsync(async (req: Request, res: Response) => {

  const paginations = pick(req.query, paginationFields)
  const result = await RequestService.getMyFreindRequestList(req.user!, paginations);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Friend Request list retrieved successfully',
    data: result,
  });
});

const getMyFriendList = catchAsync(async (req: Request, res: Response) => {

  const pagination = pick(req.query, paginationFields);

  const result = await RequestService.getMyFriendList(
    req.user!
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'FriendList retrieved successfully.',
    data: result,
  });
});


export const RequestController = {
  createRequest,
  updateRequest,
  getMyFreindRequestList,
  getMyFriendList
};