import { Model, Types } from 'mongoose';

export interface IActivityFilterables {
  searchTerm?: string;
  title?: string;
  description?: string;
  address?: string;
}

export interface IActivity {
  _id: Types.ObjectId;
  externalId: string;
  title: string;
  description?: string;
  address: string;
  date: Date;
  link?: string;
  images: string[];
}

export type ActivityModel = Model<IActivity, {}, {}>;
