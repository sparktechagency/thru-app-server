import { Model, Types } from 'mongoose';

export interface IPlanFilterables {
  searchTerm?: string;
  title?: string;
  description?: string;
  location?: string;
  address?: string;
  link?: string;
}

export type Point = {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}


export interface IPlan {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId
  title: string;
  description?: string;
  images: string[];
  date: Date;
  location: Point;
  address: string;
  link: string;
  activities: Types.ObjectId[];
  friends: Types.ObjectId[];
}

export type PlanModel = Model<IPlan, {}, {}>;
