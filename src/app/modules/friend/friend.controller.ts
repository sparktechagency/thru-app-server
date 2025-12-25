import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { FriendServices } from "./friend.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const getMyFriendList = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FriendServices.getMyFriendList(req.user!);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

export const FreindController = {
  getMyFriendList
}