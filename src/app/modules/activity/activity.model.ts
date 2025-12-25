import { Schema, model } from 'mongoose';
import { IActivity, ActivityModel } from './activity.interface';

const activitySchema = new Schema<IActivity, ActivityModel>({
  title: { type: String },
  externalId: { type: String },
  description: { type: String },
  address: { type: String },
  date: { type: Date },
  images: { type: [String] },
}, {
  timestamps: true
});

export const Activity = model<IActivity, ActivityModel>('Activity', activitySchema);
