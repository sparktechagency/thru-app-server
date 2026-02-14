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
  address: { type: String },
  collaborators: { type: [Schema.Types.ObjectId], ref: 'User', populate: { path: 'collaborators', select: 'name lastName fullName profile' } }, 
}, {
  timestamps: true
});

export const Plan = model<IPlan, PlanModel>('Plan', planSchema);
