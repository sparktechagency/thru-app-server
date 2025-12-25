import { Schema, model } from 'mongoose';
import { IPlan, PlanModel } from './plan.interface';

const planSchema = new Schema<IPlan, PlanModel>({
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  title: { type: String },
  description: { type: String },
  images: { type: [String] },
  date: { type: Date },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      default: [0.0, 0.0], // [longitude, latitude]
    },
  },
  address: { type: String },
  link: { type: String },
  activities: { type: [Schema.Types.ObjectId], ref: 'Activity' },
  friends: { type: [Schema.Types.ObjectId], ref: 'User' },
}, {
  timestamps: true
});

export const Plan = model<IPlan, PlanModel>('Plan', planSchema);
