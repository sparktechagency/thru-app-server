import { Schema, model } from 'mongoose'
import { INotification, NotificationModel } from './notifications.interface'

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    to: { type: Schema.Types.ObjectId, ref: 'User', populate: { path: 'to', select: 'name lastName fullName profile' } },
    from: { type: Schema.Types.ObjectId, ref: 'User', populate: { path: 'to', select: 'name lastName fullName profile' } },
    title: { type: String },
    friendRequestId: {
      type: Schema.Types.ObjectId, ref: 'Request'
    },
    planJoiningRequestId: {
      type: Schema.Types.ObjectId, ref: 'Request'
    },
    body: { type: String },
    isRead: { type: Boolean },
    isAdmin: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema,
)
