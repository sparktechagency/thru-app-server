"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("./comment.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const addComment = (0, catchAsync_1.default)(async (req, res) => {
    const result = await comment_service_1.CommentService.addComment(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Comment added successfully',
        data: result,
    });
});
const getCommentsByPostId = (0, catchAsync_1.default)(async (req, res) => {
    const { postId } = req.params;
    const result = await comment_service_1.CommentService.getCommentsByPostId(postId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Comments retrieved successfully',
        data: result,
    });
});
const updateComment = (0, catchAsync_1.default)(async (req, res) => {
    const result = await comment_service_1.CommentService.updateComment(req.params.id, req.body, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Comment updated successfully',
        data: result,
    });
});
const deleteComment = (0, catchAsync_1.default)(async (req, res) => {
    const result = await comment_service_1.CommentService.deleteComment(req.params.id, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Comment deleted successfully',
        data: result,
    });
});
exports.CommentController = {
    addComment,
    getCommentsByPostId,
    updateComment,
    deleteComment
};
