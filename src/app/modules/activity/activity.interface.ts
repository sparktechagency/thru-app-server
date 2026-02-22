import { Model, Types } from 'mongoose';

export interface IActivityFilterables {
  searchTerm?: string;
  title?: string;
  category?: string;
  description?: string;
  address?: string;
  planId?: string;
}

export interface IActivity {
  _id: Types.ObjectId;
  category: "eatAndDrink" | "stays" | "transportation" | "custom" | "activity";
  planId: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  description?: string;
  address: string;
  date: Date;
  endDate?: Date;
  link?: string;
  images: string[];
}

export type ActivityModel = Model<IActivity, {}, {}>;
