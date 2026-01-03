import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Friend } from '../friend/friend.model';
import { Message } from './message.model';
import { ISendMessage, IReturnableMessage, IMessageData } from './message.interface';
import { IUser } from '../user/user.interface';
import { emitEvent } from '../../../helpers/socketInstances';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';

const sendMessage = async (
    user: JwtPayload,
    friendId: string,
    payload: ISendMessage
): Promise<IMessageData> => {
    const userId = new Types.ObjectId(user.authId);
    const friendObjectId = new Types.ObjectId(friendId);

    // Find the friendship and populate users
    const friendship = await Friend.findById(friendObjectId).populate<{ users: IUser[] }>('users');

    if (!friendship) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Friendship not found');
    }

    // Verify the authenticated user is part of this friendship
    const userIds = friendship.users.map((u: IUser) => u._id.toString());
    if (!userIds.includes(userId.toString())) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to send messages in this conversation');
    }

    // Find the other user (receiver)
    const receiver = friendship.users.find((u: IUser) => !u._id.equals(userId));

    if (!receiver) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to identify receiver');
    }

    // Create the message
    const message = await Message.create({
        friend: friendObjectId,
        sender: userId,
        receiver: receiver._id,
        message: payload.message,
        isRead: false,
    });

    // Find sender details
    const sender = friendship.users.find((u: IUser) => u._id.equals(userId));

    // Return formatted message
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
    pagination: IPaginationOptions
): Promise<IReturnableMessage> => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);
    const userId = new Types.ObjectId(user.authId);
    const friendObjectId = new Types.ObjectId(friendId);

    // Find the friendship and verify user is part of it
    const friendship = await Friend.findById(friendObjectId).populate<{ users: IUser[] }>('users');

    if (!friendship) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Friendship not found');
    }

    // Verify the authenticated user is part of this friendship
    const userIds = friendship.users.map((u: IUser) => u._id.toString());
    if (!userIds.includes(userId.toString())) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view this conversation');
    }

    // Fetch all messages for this friendship
    const [messages, total] = await Promise.all([
        Message.find({ friend: friendObjectId })
            .populate<{ sender: IUser }>('sender', 'name profile')
            .populate<{ receiver: IUser }>('receiver', 'name profile')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        Message.countDocuments({ friend: friendObjectId })
    ]);



    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: messages,
    };
};

export const MessageServices = {
    sendMessage,
    getMessagesByFriend,
};
