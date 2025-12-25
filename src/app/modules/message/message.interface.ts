import { Model, Types } from 'mongoose';

export interface IMessage {
    _id: Types.ObjectId;
    friend: Types.ObjectId;
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type MessageModel = Model<IMessage, {}, {}>;

export interface ISendMessage {
    message: string;
}

export interface IReturnableMessage {
    _id: Types.ObjectId;
    friend: Types.ObjectId;
    message: string;
    isRead: boolean;
    sender: {
        _id: Types.ObjectId;
        name?: string;
        profile?: string;
    };
    receiver: {
        _id: Types.ObjectId;
        name?: string;
        profile?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
