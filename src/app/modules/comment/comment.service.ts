import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IComment } from './comment.interface';
import { Comment } from './comment.model';
import { JwtPayload } from 'jsonwebtoken';
import { Post } from '../post/post.model';
import { sendNotification } from '../../../helpers/notificationHelper';
import { User } from '../user/user.model';

import mongoose, { ClientSession } from 'mongoose';

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

const getCommentsByPostId = async (postId: string): Promise<IComment[]> => {
    const result = await Comment.find({ postId })
        .populate('commentedBy', 'name lastName profile email')
        .sort({ createdAt: -1 });

    return result;
};

export const CommentService = {
    addComment,
    getCommentsByPostId,
};
