import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MessageServices } from './message.service';
import { paginationFields } from '../../../interfaces/pagination';
import pick from '../../../shared/pick';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
    const { friendId } = req.params;
    const result = await MessageServices.sendMessage(req.user!, friendId, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Message sent successfully',
        data: result,
    });
});

const getMessagesByFriend = catchAsync(async (req: Request, res: Response) => {
    const { friendId } = req.params;
    const pagination = pick(req.query, paginationFields);
    const result = await MessageServices.getMessagesByFriend(req.user!, friendId, pagination);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Messages retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

export const MessageController = {
    sendMessage,
    getMessagesByFriend,
};
