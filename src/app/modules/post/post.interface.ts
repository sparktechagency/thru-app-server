import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IPost {
    _id: Types.ObjectId;
    title: string;
    images?: string[];
    user: Types.ObjectId | IUser;
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type PostModel = Model<IPost, {}, {}>;
