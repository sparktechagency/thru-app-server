import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { FriendServices } from "./friend.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick";

const getMyFriendList = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const filtersData = pick(req.query, ['planId']);
  const result = await FriendServices.getMyFriendList(req.user!, filtersData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Friend list retrieved successfully',
    data: result,
  });
});

export const FriendController = {
  getMyFriendList
}