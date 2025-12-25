import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';

const messageSchema = new Schema<IMessage, MessageModel>({
    friend: { type: Schema.Types.ObjectId, ref: 'Friend', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, {
    timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ friend: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

export const Message = model<IMessage, MessageModel>('Message', messageSchema);
