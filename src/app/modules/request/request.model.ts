import { Schema, model } from 'mongoose';
import { IRequest, RequestModel, REQUEST_STATUS } from './request.interface';

const requestSchema = new Schema<IRequest, RequestModel>({
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  requestedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: Object.values(REQUEST_STATUS), default: REQUEST_STATUS.PENDING },
}, {
  timestamps: true
});

export const Request = model<IRequest, RequestModel>('Request', requestSchema);
