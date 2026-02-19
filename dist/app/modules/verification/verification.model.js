"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verification = void 0;
const mongoose_1 = require("mongoose");
const verification_interface_1 = require("./verification.interface");
const verificationSchema = new mongoose_1.Schema({
    type: { type: String, enum: Object.values(verification_interface_1.VERIFICATION_TYPE) },
    identifier: { type: String, required: true },
    otpHash: { type: String },
    latestRequest: { type: Date, default: null },
    otpExpiresAt: { type: Date, default: null },
    requestCount: { type: Number, default: 0 },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 60 * 1000),
    },
    attempts: { type: Number, default: 0 },
}, {
    timestamps: true,
});
verificationSchema.index({ identifier: 1, type: 1 }, { unique: true });
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.Verification = (0, mongoose_1.model)('Verification', verificationSchema);
