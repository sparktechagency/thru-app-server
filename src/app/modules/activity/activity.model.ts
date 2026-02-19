import { Schema, Types, model } from 'mongoose';
import { IActivity, ActivityModel } from './activity.interface';

const activitySchema = new Schema<IActivity, ActivityModel>({
  title: { type: String },
  category: { type: String },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String },
  date: { type: Date },
  endDate: { type: Date },
  link: { type: String },
  images: { type: [String] },
}, {
  timestamps: true
});

export const Activity = model<IActivity, ActivityModel>('Activity', activitySchema);
