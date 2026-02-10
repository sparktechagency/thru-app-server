import { Request, Response } from 'express';
import { MessageServices } from './message.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
    const { friendId } = req.params;
    const result = await MessageServices.sendMessage(req.user!, friendId, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Message sent successfully',
        data: result,
    });
});

const getMessagesByFriend = catchAsync(async (req: Request, res: Response) => {
    const { friendId } = req.params;
    const result = await MessageServices.getMessagesByFriend(req.user!, friendId, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Messages retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const sendGroupMessage = catchAsync(async (req: Request, res: Response) => {
    const { planId } = req.params;
    const result = await MessageServices.sendGroupMessage(req.user!, planId, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Group message sent successfully',
        data: result,
    });
});

const getMessagesByPlan = catchAsync(async (req: Request, res: Response) => {
    const { planId } = req.params;
    const result = await MessageServices.getMessagesByPlan(req.user!, planId, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Group messages retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const updateMessage = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await MessageServices.updateMessage(req.user!, id, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Message updated successfully',
        data: result,
    });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await MessageServices.deleteMessage(req.user!, id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Message deleted successfully',
        data: result,
    });
});

export const MessageController = {
    sendMessage,
    getMessagesByFriend,
    sendGroupMessage,
    getMessagesByPlan,
    updateMessage,
    deleteMessage,
};
