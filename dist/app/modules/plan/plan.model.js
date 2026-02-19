"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plan = void 0;
const mongoose_1 = require("mongoose");
const planSchema = new mongoose_1.Schema({
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'createdBy', select: 'name lastName fullName profile' }
    },
    title: { type: String },
    description: { type: String },
    images: { type: [String] },
    date: { type: Date },
    endDate: { type: Date },
    address: { type: String },
    collaborators: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'User', populate: { path: 'collaborators', select: 'name lastName fullName profile' } },
}, {
    timestamps: true
});
exports.Plan = (0, mongoose_1.model)('Plan', planSchema);
