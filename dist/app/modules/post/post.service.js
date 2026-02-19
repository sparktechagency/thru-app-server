"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServices = void 0;
const post_model_1 = require("./post.model");
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const post_constants_1 = require("./post.constants");
const user_1 = require("../../../enum/user");
const createPost = async (user, payload) => {
    payload.user = user.authId;
    const result = await post_model_1.Post.create(payload);
    await result.populate('user', 'name lastName profile email');
    return result;
};
const getAllPosts = async (query) => {
    const postQuery = new QueryBuilder_1.default(post_model_1.Post.find(), query)
        .search(post_constants_1.postSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await postQuery.modelQuery.populate('user', 'name lastName profile email');
    const meta = await postQuery.getPaginationInfo();
    return {
        meta,
        data: result,
    };
};
const getMyPosts = async (user, query) => {
    const postQuery = new QueryBuilder_1.default(post_model_1.Post.find({ user: user.authId }), query)
        .filter()
        .sort()
        .paginate();
    const result = await postQuery.modelQuery.populate('user', 'name lastName profile email');
    const meta = await postQuery.getPaginationInfo();
    return {
        meta,
        data: result,
    };
};
const getPostById = async (id) => {
    const result = await post_model_1.Post.findById(id).populate('user', 'name lastName profile email');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    return result;
};
const updatePost = async (id, payload, user) => {
    const post = await post_model_1.Post.findById(id);
    if (!post) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    if (post.user.toString() !== user.authId && user.role !== user_1.USER_ROLES.ADMIN) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to update this post');
    }
    const result = await post_model_1.Post.findByIdAndUpdate(id, payload, { new: true });
    await (result === null || result === void 0 ? void 0 : result.populate('user', 'name lastName profile email'));
    return result;
};
const deletePost = async (id, user) => {
    const post = await post_model_1.Post.findById(id);
    if (!post) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Post not found');
    }
    if (post.user.toString() !== user.authId && user.role !== user_1.USER_ROLES.ADMIN) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to delete this post');
    }
    const result = await post_model_1.Post.findByIdAndDelete(id);
    return result;
};
exports.PostServices = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getMyPosts
};
