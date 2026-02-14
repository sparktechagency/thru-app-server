import { Model, Types } from 'mongoose';

export interface IMessage {
    _id: Types.ObjectId;
    friend?: Types.ObjectId;
    plan?: Types.ObjectId;
    sender: Types.ObjectId;
    receiver?: Types.ObjectId;
    message?: string;
    images?: string[];
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type MessageModel = Model<IMessage, {}, {}>;

export interface ISendMessage {
    message: string;
    images?: string[];
}

export interface IMessageData {
    _id: Types.ObjectId;
    friend?: Types.ObjectId;
    plan?: Types.ObjectId;
    message: string;
    isRead: boolean;
    sender: {
        _id: Types.ObjectId;
        name?: string;
        profile?: string;
    };
    receiver?: {
        _id: Types.ObjectId;
        name?: string;
        profile?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface IReturnableMessage {
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPage: number;
    },
    data: IMessageData[];
}
