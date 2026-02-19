"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    to: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'to', select: 'name lastName fullName profile' } },
    from: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'to', select: 'name lastName fullName profile' } },
    title: { type: String },
    friendRequestId: {
        type: mongoose_1.Schema.Types.ObjectId, ref: 'Request'
    },
    planJoiningRequestId: {
        type: mongoose_1.Schema.Types.ObjectId, ref: 'Request'
    },
    body: { type: String },
    isRead: { type: Boolean },
    isAdmin: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
}, {
    timestamps: true,
});
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
