"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const mongoose_1 = require("mongoose");
const tokenSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: new Date(Date.now() + 15 * 60 * 100),
    },
}, {
    timestamps: true,
});
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.Token = (0, mongoose_1.model)('Token', tokenSchema);
