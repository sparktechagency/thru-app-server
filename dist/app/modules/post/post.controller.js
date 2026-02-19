"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const post_service_1 = require("./post.service");
const createPost = (0, catchAsync_1.default)(async (req, res) => {
    const result = await post_service_1.PostServices.createPost(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Post created successfully',
        data: result,
    });
});
const getAllPosts = (0, catchAsync_1.default)(async (req, res) => {
    const result = await post_service_1.PostServices.getAllPosts(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Posts retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
const getMyPosts = (0, catchAsync_1.default)(async (req, res) => {
    const result = await post_service_1.PostServices.getMyPosts(req.user, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Posts retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
const getPostById = (0, catchAsync_1.default)(async (req, res) => {
    const result = await post_service_1.PostServices.getPostById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Post retrieved successfully',
        data: result,
    });
});
const updatePost = (0, catchAsync_1.default)(async (req, res) => {
    const result = await post_service_1.PostServices.updatePost(req.params.id, req.body, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Post updated successfully',
        data: result,
    });
});
const deletePost = (0, catchAsync_1.default)(async (req, res) => {
    const result = await post_service_1.PostServices.deletePost(req.params.id, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Post deleted successfully',
        data: result,
    });
});
exports.PostControllers = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getMyPosts
};
