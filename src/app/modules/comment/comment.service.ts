import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IComment } from './comment.interface';
import { Comment } from './comment.model';
import { JwtPayload } from 'jsonwebtoken';
import { Plan } from '../plan/plan.model';
import { sendNotification } from '../../../helpers/notificationHelper';
import { User } from '../user/user.model';

import mongoose, { ClientSession } from 'mongoose';

const addComment = async (user: JwtPayload, payload: Partial<IComment>): Promise<IComment> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
        const plan = await Plan.findById(payload.planId).session(session);
        if (!plan) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Plan not found');
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

        // Increment commentCount on plan
        await Plan.findByIdAndUpdate(
            payload.planId,
            { $inc: { commentCount: 1 } },
            { session, new: true }
        );

        await session.commitTransaction();

        // Send notification to plan owner
        if (plan.createdBy.toString() !== user.authId.toString()) {
            const planOwner = await User.findById(plan.createdBy);
            if (planOwner) {
                await sendNotification(
                    {
                        authId: user.authId,
                        name: user.name,
                        profile: user.profile,
                    },
                    plan.createdBy.toString(),
                    'New Comment on your Plan',
                    `${user.name} commented on your plan: ${plan.title}`
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

const getCommentsByPlanId = async (planId: string): Promise<IComment[]> => {
    const result = await Comment.find({ planId })
        .populate('commentedBy', 'name lastName profile email')
        .sort({ createdAt: -1 });

    return result;
};

export const CommentService = {
    addComment,
    getCommentsByPlanId,
};
