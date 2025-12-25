import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export enum REQUEST_STATUS {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum REQUEST_TYPE {
  PLAN = 'plan',
  FRIEND = 'friend'
}

export interface IRequestFilterables {
  searchTerm?: string;
  status?: REQUEST_STATUS;
}

export interface IRequest {
  _id: Types.ObjectId;
  requestedBy: Types.ObjectId | IUser;
  requestedTo: Types.ObjectId | IUser;
  status: REQUEST_STATUS;
  type: REQUEST_TYPE;
  createdAt: Date;
  updatedAt: Date
}

export type RequestModel = Model<IRequest, {}, {}>;
