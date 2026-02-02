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
  category: string;
  description?: string;
  images: string[];
  date: Date;
  endDate?: Date;
  location: Point;
  address: string;
  link: string;
  activities: Types.ObjectId[];
  friends: Types.ObjectId[];
  commentCount: number;
}

export type PlanModel = Model<IPlan, {}, {}>;

export interface ISearchResult {
  title: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  thumbnail?: string;
  link?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  date?: {
    start?: string;
    when?: string;
  };
  venue?: {
    name?: string;
    link?: string;
  };
}

export interface ISearchQuery {
  searchTerm?: string;
  location?: string;
  address?: string;
  category?: string;
  dateFilter?: 'today' | 'tomorrow' | 'week' | 'weekend' | 'next_week' | 'month' | 'next_month' | 'range';
  startDate?: string;
  endDate?: string;
}
