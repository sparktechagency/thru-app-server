"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    friend: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Friend' },
    plan: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Plan' },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
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
exports.Message = (0, mongoose_1.model)('Message', messageSchema);
