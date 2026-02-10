import { Model, Types } from 'mongoose';

export interface IActivityFilterables {
  searchTerm?: string;
  title?: string;
  category?: string;
  description?: string;
  address?: string;
}

export interface IActivity {
  _id: Types.ObjectId;
  category: "eat&drink" | "stays" | "transportation" | "custom" | "activity";
  createdBy: Types.ObjectId;
  title: string;
  description?: string;
  address: string;
  date: Date;
  link?: string;
  images: string[];
}

export type ActivityModel = Model<IActivity, {}, {}>;
