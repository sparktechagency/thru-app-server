"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const friend_service_1 = require("./friend.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pick_1 = __importDefault(require("../../../shared/pick"));
const getMyFriendList = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const filtersData = (0, pick_1.default)(req.query, ['planId']);
    const result = await friend_service_1.FriendServices.getMyFriendList(req.user, filtersData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Friend list retrieved successfully',
        data: result,
    });
});
exports.FriendController = {
    getMyFriendList
};
