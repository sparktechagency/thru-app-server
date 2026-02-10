import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { PostServices } from './post.service';

const createPost = catchAsync(async (req: Request, res: Response) => {
    const result = await PostServices.createPost(req.user!, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'Post created successfully',
        data: result,
    });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    const result = await PostServices.getAllPosts(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Posts retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
    const result = await PostServices.getPostById(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Post retrieved successfully',
        data: result,
    });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
    const result = await PostServices.updatePost(req.params.id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Post updated successfully',
        data: result,
    });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
    const result = await PostServices.deletePost(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Post deleted successfully',
        data: result,
    });
});

export const PostControllers = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
};
