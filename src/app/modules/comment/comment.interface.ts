import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IPlan } from '../plan/plan.interface';

export interface IComment {
    _id: Types.ObjectId;
    commentedBy: Types.ObjectId | IUser;
    planId: Types.ObjectId | IPlan;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CommentModel = Model<IComment, {}, {}>;
