import { Schema, Types, model } from 'mongoose';
import { IActivity, ActivityModel } from './activity.interface';

const activitySchema = new Schema<IActivity, ActivityModel>({
  title: { type: String },
  category: { type: String },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String },
  date: { type: Date },
  link: { type: String },
  images: { type: [String] },
}, {
  timestamps: true
});

export const Activity = model<IActivity, ActivityModel>('Activity', activitySchema);
