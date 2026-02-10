import { Model, Types } from 'mongoose';

export interface IPlanFilterables {
  searchTerm?: string;
  title?: string;
  description?: string;
  address?: string;
}

export interface IPlan {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  description?: string;
  images: string[];
  date: Date;
  endDate?: Date;
  address: string;
  eatAndDrink: Types.ObjectId[];
  stays: Types.ObjectId[];
  transportation: Types.ObjectId[];
  custom: Types.ObjectId[];
  activities: Types.ObjectId[];
  collaborators: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type PlanModel = Model<IPlan, {}, {}>;
