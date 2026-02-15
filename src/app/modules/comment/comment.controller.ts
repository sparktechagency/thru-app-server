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

const getCommentsByPostId = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const result = await CommentService.getCommentsByPostId(postId, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Comments retrieved successfully',
        data: result,
    });
});

const updateComment = catchAsync(async(req:Request, res:Response)=>{
    const result = await CommentService.updateComment(req.params.id,req.body,req.user!)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Comment updated successfully',
        data: result,
    });
})

const deleteComment = catchAsync(async(req:Request, res:Response)=>{
    const result = await CommentService.deleteComment(req.params.id,req.user!)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Comment deleted successfully',
        data: result,
    });
})

export const CommentController = {
    addComment,
    getCommentsByPostId,
    updateComment,
    deleteComment
};
