import { JwtPayload } from 'jsonwebtoken';
import { IPost } from './post.interface';
import { Post } from './post.model';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

import QueryBuilder from '../../builder/QueryBuilder';
import { postSearchableFields } from './post.constants';
import { USER_ROLES } from '../../../enum/user';

const createPost = async (user: JwtPayload, payload: IPost): Promise<IPost> => {
    payload.user = user.authId;
    const result = await Post.create(payload);
    await result.populate('user', 'name lastName profile email');
    return result;
};

const getAllPosts = async (query: Record<string, unknown>) => {
    const postQuery = new QueryBuilder(Post.find(), query)
        .search(postSearchableFields)
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

const getMyPosts = async (user: JwtPayload, query: Record<string, unknown>) => {
    const postQuery = new QueryBuilder(Post.find({ user: user.authId }), query)
        .filter()
        .sort()
        .paginate()

    const result = await postQuery.modelQuery.populate('user', 'name lastName profile email');
    const meta = await postQuery.getPaginationInfo();

    return {
        meta,
        data: result,
    };
};

const getPostById = async (id: string): Promise<IPost | null> => {
    const result = await Post.findById(id).populate('user', 'name lastName profile email');
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
    }
    return result;
};

const updatePost = async (id: string, payload: Partial<IPost>, user: JwtPayload): Promise<IPost | null> => {
    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
    }
    if (post.user.toString() !== user.authId && user.role !== USER_ROLES.ADMIN) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this post');
    }
    const result = await Post.findByIdAndUpdate(id, payload, { new: true });
    await result?.populate('user', 'name lastName profile email');
    return result;
};

const deletePost = async (id: string, user: JwtPayload): Promise<IPost | null> => {
    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
    }
    if (post.user.toString() !== user.authId && user.role !== USER_ROLES.ADMIN) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this post');
    }
    const result = await Post.findByIdAndDelete(id);
    return result;
};

export const PostServices = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getMyPosts
};
