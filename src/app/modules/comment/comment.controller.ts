import { Request, Response } from 'express';
import { CommentService } from './comment.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const addComment = catchAsync(async (req: Request, res: Response) => {
    const result = await CommentService.addComment(req.user!, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Comment added successfully',
        data: result,
    });
});

const getCommentsByPlanId = catchAsync(async (req: Request, res: Response) => {
    const { planId } = req.params;
    const result = await CommentService.getCommentsByPlanId(planId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Comments retrieved successfully',
        data: result,
    });
});

export const CommentController = {
    addComment,
    getCommentsByPlanId,
};
