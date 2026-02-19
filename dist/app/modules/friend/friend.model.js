"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Friend = void 0;
const mongoose_1 = require("mongoose");
const friendSchema = new mongoose_1.Schema({
    users: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'User' },
    requestId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Request' },
    lastMessage: { type: String, default: 'Hello' },
    isLastMessageRead: { type: Boolean, default: false },
}, {
    timestamps: true
});
exports.Friend = (0, mongoose_1.model)('Friend', friendSchema);
