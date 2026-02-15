import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IComment } from './comment.interface';
import { Comment } from './comment.model';
import { JwtPayload } from 'jsonwebtoken';
import { Post } from '../post/post.model';
import { sendNotification } from '../../../helpers/notificationHelper';
import { User } from '../user/user.model';

import mongoose, { ClientSession } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enum/user';

const addComment = async (user: JwtPayload, payload: Partial<IComment>): Promise<IComment> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
        const post = await Post.findById(payload.postId).session(session);
        if (!post) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
        }

        const commentData = {
            ...payload,
            commentedBy: user.authId,
        };

        const result = await Comment.create([commentData], { session });
        if (!result || result.length === 0) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to add comment');
        }

        const comment = result[0];

        // Increment commentCount on post
        await Post.findByIdAndUpdate(
            payload.postId,
            { $inc: { commentCount: 1 } },
            { session, new: true }
        );

        await session.commitTransaction();

        // Send notification to post owner
        if (post.user.toString() !== user.authId.toString()) {
            const postOwner = await User.findById(post.user);
            if (postOwner) {
                await sendNotification(
                    {
                        authId: user.authId,
                        name: user.name,
                        profile: user.profile,
                    },
                    post.user.toString(),
                    'New Comment on your Post',
                    `${user.name} commented on your post: ${post.title}`
                );
            }
        }

        return comment;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

const getCommentsByPostId = async (postId: string, query: Record<string, unknown>) => {
    const commentQuery = new QueryBuilder(Comment.find({ postId }),query)
                        .filter()
                        .paginate()
      
        
    const result = await commentQuery.modelQuery.populate('commentedBy', 'name lastName profile email')
    const meta = await commentQuery.getPaginationInfo();

    return {meta,data:result};
};

const updateComment = async (id: string, payload: Partial<IComment>, user: JwtPayload): Promise<IComment | null> => {
    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
    }
    if (comment.commentedBy.toString() !== user.authId && user.role !== USER_ROLES.ADMIN) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this comment');
    }
    const result = await Comment.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

const deleteComment = async (id: string, user: JwtPayload): Promise<IComment | null> => {
    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');
    }
    if (comment.commentedBy.toString() !== user.authId && user.role !== USER_ROLES.ADMIN) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this comment');
    }
    const result = await Comment.findByIdAndDelete(id);
    return result;
};

export const CommentService = {
    addComment,
    getCommentsByPostId,
    updateComment,
    deleteComment
};
