import { Schema, model } from 'mongoose'
import { INotification, NotificationModel } from './notifications.interface'

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    to: { type: Schema.Types.ObjectId, ref: 'User', populate: 'name profile' },
    from: { type: Schema.Types.ObjectId, ref: 'User', populate: 'name profile' },
    title: { type: String },
    friendRequestId: {
      type: Schema.Types.ObjectId, ref: 'User'
    },
    planJoiningRequestId: {
      type: Schema.Types.ObjectId, ref: 'User'
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
