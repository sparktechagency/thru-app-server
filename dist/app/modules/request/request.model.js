"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const mongoose_1 = require("mongoose");
const request_interface_1 = require("./request.interface");
const requestSchema = new mongoose_1.Schema({
    requestedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    requestedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    planId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Plan' },
    status: { type: String, enum: Object.values(request_interface_1.REQUEST_STATUS), default: request_interface_1.REQUEST_STATUS.PENDING },
    type: { type: String, enum: Object.values(request_interface_1.REQUEST_TYPE) },
}, {
    timestamps: true
});
exports.Request = (0, mongoose_1.model)('Request', requestSchema);
