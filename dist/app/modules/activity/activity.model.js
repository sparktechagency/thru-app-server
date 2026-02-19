"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const mongoose_1 = require("mongoose");
const activitySchema = new mongoose_1.Schema({
    title: { type: String },
    category: { type: String },
    planId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Plan', required: true },
    description: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String },
    date: { type: Date },
    link: { type: String },
    images: { type: [String] },
}, {
    timestamps: true
});
exports.Activity = (0, mongoose_1.model)('Activity', activitySchema);
