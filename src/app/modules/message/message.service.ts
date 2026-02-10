import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Friend } from '../friend/friend.model';
import { Message } from './message.model';
import { ISendMessage, IReturnableMessage, IMessageData, IMessage } from './message.interface';
import { IUser } from '../user/user.interface';
import { emitEvent } from '../../../helpers/socketInstances';
import QueryBuilder from '../../builder/QueryBuilder';
import { Plan } from '../plan/plan.model';
import { messageSearchableFields } from './message.constants';

const sendMessage = async (
    user: JwtPayload,
    friendId: string,
    payload: ISendMessage
): Promise<IMessageData> => {
    const userId = new Types.ObjectId(user.authId);
    const friendObjectId = new Types.ObjectId(friendId);

    const friendship = await Friend.findById(friendObjectId).populate<{ users: IUser[] }>('users');

    if (!friendship) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Friendship not found');
    }

    const userIds = friendship.users.map((u: IUser) => u._id.toString());
    if (!userIds.includes(userId.toString())) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to send messages in this conversation');
    }

    const receiver = friendship.users.find((u: IUser) => !u._id.equals(userId));

    if (!receiver) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to identify receiver');
    }

    const message = await Message.create({
        friend: friendObjectId,
        sender: userId,
        receiver: receiver._id,
        message: payload.message,
        isRead: false,
    });

    const sender = friendship.users.find((u: IUser) => u._id.equals(userId));

    const returnableMessage: IMessageData = {
        _id: message._id,
        friend: message.friend,
        message: message.message,
        isRead: message.isRead,
        sender: {
            _id: userId,
            name: sender?.name,
            profile: sender?.profile,
        },
        receiver: {
            _id: receiver._id,
            name: receiver.name,
            profile: receiver.profile,
        },
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    };

    emitEvent(`message::${message.friend}`, returnableMessage);

    return returnableMessage;
};

const getMessagesByFriend = async (
    user: JwtPayload,
    friendId: string,
    query: Record<string, unknown>
): Promise<any> => {
    const userId = new Types.ObjectId(user.authId);
    const friendObjectId = new Types.ObjectId(friendId);

    const friendship = await Friend.findById(friendObjectId).populate<{ users: IUser[] }>('users');

    if (!friendship) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Friendship not found');
    }

    const userIds = friendship.users.map((u: IUser) => u._id.toString());
    if (!userIds.includes(userId.toString())) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view this conversation');
    }

    const messageQuery = new QueryBuilder(
        Message.find({ friend: friendObjectId }),
        query
    )
        .search(messageSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await messageQuery.modelQuery
        .populate('sender', 'name profile')
        .populate('receiver', 'name profile');

    const meta = await messageQuery.getPaginationInfo();

    return {
        meta,
        data: result,
    };
};

const sendGroupMessage = async (
    user: JwtPayload,
    planId: string,
    payload: ISendMessage
): Promise<IMessageData> => {
    const userId = new Types.ObjectId(user.authId);
    const planObjectId = new Types.ObjectId(planId);

    const plan = await Plan.findById(planObjectId).select('createdBy collaborators');

    if (!plan) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Plan not found');
    }

    const isAuthorized = plan.createdBy.equals(userId) ||
        plan.collaborators.some(collabId => collabId.equals(userId));

    if (!isAuthorized) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to send messages in this group chat');
    }

    const message = await Message.create({
        plan: planObjectId,
        sender: userId,
        message: payload.message,
    });

    const populatedMessage = await Message.findById(message._id)
        .populate<{ sender: IUser }>('sender', 'name profile')
        .lean();

    const returnableMessage: IMessageData = {
        _id: message._id,
        plan: message.plan,
        message: message.message,
        isRead: message.isRead,
        sender: {
            _id: userId,
            name: populatedMessage?.sender.name,
            profile: populatedMessage?.sender.profile,
        },
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    };

    emitEvent(`message::${planId}`, returnableMessage);

    return returnableMessage;
};

const getMessagesByPlan = async (
    user: JwtPayload,
    planId: string,
    query: Record<string, unknown>
): Promise<any> => {
    const userId = new Types.ObjectId(user.authId);
    const planObjectId = new Types.ObjectId(planId);

    const plan = await Plan.findById(planObjectId).select('createdBy collaborators');

    if (!plan) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Plan not found');
    }

    const isAuthorized = plan.createdBy.equals(userId) ||
        plan.collaborators.some(collabId => collabId.equals(userId));

    if (!isAuthorized) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view this group chat');
    }

    const messageQuery = new QueryBuilder(
        Message.find({ plan: planObjectId }),
        query
    )
        .search(messageSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await messageQuery.modelQuery
        .populate('sender', 'name profile');

    const meta = await messageQuery.getPaginationInfo();

    return {
        meta,
        data: result,
    };
};

const updateMessage = async (
    user: JwtPayload,
    id: string,
    payload: ISendMessage
): Promise<IMessage | null> => {
    const userId = new Types.ObjectId(user.authId);
    const message = await Message.findById(id);

    if (!message) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
    }

    const isAuthorized = message.sender.equals(userId) || user.role === 'ADMIN';

    if (!isAuthorized) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to edit this message');
    }

    const result = await Message.findByIdAndUpdate(
        id,
        { $set: { message: payload.message } },
        { new: true, runValidators: true }
    );

    return result;
};

const deleteMessage = async (
    user: JwtPayload,
    id: string
): Promise<IMessage | null> => {
    const userId = new Types.ObjectId(user.authId);
    const message = await Message.findById(id);

    if (!message) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
    }

    const isAuthorized = message.sender.equals(userId) || user.role === 'ADMIN';

    if (!isAuthorized) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this message');
    }

    const result = await Message.findByIdAndDelete(id);

    return result;
};

export const MessageServices = {
    sendMessage,
    getMessagesByFriend,
    sendGroupMessage,
    getMessagesByPlan,
    updateMessage,
    deleteMessage,
};
