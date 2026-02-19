"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const comment_model_1 = require("./comment.model");
const post_model_1 = require("../post/post.model");
const notificationHelper_1 = require("../../../helpers/notificationHelper");
const user_model_1 = require("../user/user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const user_1 = require("../../../enum/user");
const addComment = async (user, payload) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const post = await post_model_1.Post.findById(payload.postId).session(session);
        if (!post) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
        }
        const commentData = {
            ...payload,
            commentedBy: user.authId,
        };
        const result = await comment_model_1.Comment.create([commentData], { session });
        if (!result || result.length === 0) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to add comment');
        }
        const comment = result[0];
        // Increment commentCount on post
        await post_model_1.Post.findByIdAndUpdate(payload.postId, { $inc: { commentCount: 1 } }, { session, new: true });
        await session.commitTransaction();
        // Send notification to post owner
        if (post.user.toString() !== user.authId.toString()) {
            const postOwner = await user_model_1.User.findById(post.user);
            if (postOwner) {
                await (0, notificationHelper_1.sendNotification)({
                    authId: user.authId,
                    name: user.name,
                    profile: user.profile,
                }, post.user.toString(), 'New Comment on your Post', `${user.name} commented on your post: ${post.title}`);
            }
        }
        return comment;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
};
const getCommentsByPostId = async (postId, query) => {
    const commentQuery = new QueryBuilder_1.default(comment_model_1.Comment.find({ postId }), query)
        .filter()
        .paginate();
    const result = await commentQuery.modelQuery.populate('commentedBy', 'name lastName profile email');
    const meta = await commentQuery.getPaginationInfo();
    return { meta, data: result };
};
const updateComment = async (id, payload, user) => {
    const comment = await comment_model_1.Comment.findById(id);
    if (!comment) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found');
    }
    if (comment.commentedBy.toString() !== user.authId && user.role !== user_1.USER_ROLES.ADMIN) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to update this comment');
    }
    const result = await comment_model_1.Comment.findByIdAndUpdate(id, payload, { new: true });
    return result;
};
const deleteComment = async (id, user) => {
    const comment = await comment_model_1.Comment.findById(id);
    if (!comment) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Comment not found');
    }
    if (comment.commentedBy.toString() !== user.authId && user.role !== user_1.USER_ROLES.ADMIN) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to delete this comment');
    }
    const result = await comment_model_1.Comment.findByIdAndDelete(id);
    return result;
};
exports.CommentService = {
    addComment,
    getCommentsByPostId,
    updateComment,
    deleteComment
};
