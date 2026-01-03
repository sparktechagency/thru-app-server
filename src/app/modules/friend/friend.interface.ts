import { Model, Types } from 'mongoose';

export interface IFriend {
  _id: Types.ObjectId;
  users: Types.ObjectId[];
  requestId: Types.ObjectId;
  isInPlan?: boolean;
  lastMessage?: string;
  isLastMessageRead?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type FriendModel = Model<IFriend, {}, {}>;
