import { Schema, model } from 'mongoose';
import { IPlan, PlanModel } from './plan.interface';

const planSchema = new Schema<IPlan, PlanModel>({
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User', populate: { path: 'createdBy', select: 'name lastName fullName profile' }
  },
  title: { type: String },
  description: { type: String },
  images: { type: [String] },
  date: { type: Date },
  endDate: { type: Date },
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
  friends: { type: [Schema.Types.ObjectId], ref: 'User', populate: { path: 'friends', select: 'name lastName fullName profile' } },
  commentCount: { type: Number, default: 0 },
}, {
  timestamps: true
});

export const Plan = model<IPlan, PlanModel>('Plan', planSchema);
