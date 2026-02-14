import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';

const messageSchema = new Schema<IMessage, MessageModel>({
    friend: { type: Schema.Types.ObjectId, ref: 'Friend' },
    plan: { type: Schema.Types.ObjectId, ref: 'Plan' },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    images: { type: [String] },
    isRead: { type: Boolean, default: false },
}, {
    timestamps: true
});

// Logic to ensure either friend OR plan is provided
messageSchema.pre('save', function (next) {
    if (!this.friend && !this.plan) {
        return next(new Error('Message must belong to either a friend conversation or a plan group chat.'));
    }
    if (this.friend && this.plan) {
        return next(new Error('Message cannot belong to both a friend and a plan at the same time.'));
    }
    if (this.friend && !this.receiver) {
        return next(new Error('Individual message must have a receiver.'));
    }
    next();
});

// Indexes for efficient queries
messageSchema.index({ friend: 1, createdAt: -1 });
messageSchema.index({ plan: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

export const Message = model<IMessage, MessageModel>('Message', messageSchema);
