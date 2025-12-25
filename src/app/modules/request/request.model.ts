import { Schema, model } from 'mongoose';
import { IRequest, RequestModel, REQUEST_STATUS, REQUEST_TYPE } from './request.interface';

const requestSchema = new Schema<IRequest, RequestModel>({
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  requestedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: Object.values(REQUEST_STATUS), default: REQUEST_STATUS.PENDING },
  type: { type: String, enum: Object.values(REQUEST_TYPE) },
}, {
  timestamps: true
});

export const Request = model<IRequest, RequestModel>('Request', requestSchema);
