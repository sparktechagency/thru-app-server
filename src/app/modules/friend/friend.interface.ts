import { Model, Types } from 'mongoose';

export interface IFriend {
  _id: Types.ObjectId;
  users: Types.ObjectId[];
  requestId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type FriendModel = Model<IFriend, {}, {}>;
