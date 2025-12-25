import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Friend } from '../friend/friend.model';
import { Message } from './message.model';
import { ISendMessage, IReturnableMessage } from './message.interface';
import { IUser } from '../user/user.interface';
import { emitEvent } from '../../../helpers/socketInstances';

const sendMessage = async (
    user: JwtPayload,
    friendId: string,
    payload: ISendMessage
): Promise<IReturnableMessage> => {
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
    const returnableMessage: IReturnableMessage = {
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

    emitEvent(`message::${receiver._id}`, returnableMessage);


    return returnableMessage;
};

const getMessagesByFriend = async (
    user: JwtPayload,
    friendId: string
): Promise<IReturnableMessage[]> => {
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
    const messages = await Message.find({ friend: friendObjectId })
        .populate<{ sender: IUser }>('sender', 'name profile')
        .populate<{ receiver: IUser }>('receiver', 'name profile')
        .sort({ createdAt: 1 }) // Oldest first (chronological order)
        .lean();

    // Format messages
    const returnableMessages: IReturnableMessage[] = messages.map((msg: any) => ({
        _id: msg._id,
        friend: msg.friend,
        message: msg.message,
        isRead: msg.isRead,
        sender: {
            _id: msg.sender._id,
            name: msg.sender.name,
            profile: msg.sender.profile,
        },
        receiver: {
            _id: msg.receiver._id,
            name: msg.receiver.name,
            profile: msg.receiver.profile,
        },
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
    }));

    return returnableMessages;
};

export const MessageServices = {
    sendMessage,
    getMessagesByFriend,
};
