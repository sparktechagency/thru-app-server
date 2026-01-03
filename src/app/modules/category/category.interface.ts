import { Model, Types } from 'mongoose';

export interface ICategoryFilterables {
  searchTerm?: string;
  title?: string;
  image?: string;
}

export interface ICategory {
  _id: Types.ObjectId;
  title: string;
  image?: string;
}

export type CategoryModel = Model<ICategory, {}, {}>;
