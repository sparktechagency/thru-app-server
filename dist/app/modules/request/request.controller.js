"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pick_1 = __importDefault(require("../../../shared/pick"));
const pagination_1 = require("../../../interfaces/pagination");
const request_service_1 = require("./request.service");
const createRequest = (0, catchAsync_1.default)(async (req, res) => {
    const { requestedTo } = req.params;
    console.log(requestedTo);
    const result = await request_service_1.RequestService.sendFriendRequest(req.user, requestedTo);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Request sent successfully',
        data: result,
    });
});
const updateRequest = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const requestData = req.body;
    const result = await request_service_1.RequestService.acceptOrRejectRequest(req.user, requestData, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Request status updated successfully',
        data: result,
    });
});
const getMyFreindRequestList = (0, catchAsync_1.default)(async (req, res) => {
    const paginations = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await request_service_1.RequestService.getMyFreindRequestList(req.user, paginations);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Friend Request list retrieved successfully',
        data: result,
    });
});
const sendPlanRequest = (0, catchAsync_1.default)(async (req, res) => {
    const { requestedTo, planId } = req.body;
    const result = await request_service_1.RequestService.sendPlanRequest(req.user, requestedTo, planId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: result.message,
        data: result,
    });
});
const acceptOrRejectPlanRequest = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const requestData = req.body;
    const result = await request_service_1.RequestService.acceptOrRejectPlanRequest(req.user, requestData, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: result.message,
        data: result,
    });
});
exports.RequestController = {
    createRequest,
    updateRequest,
    getMyFreindRequestList,
    sendPlanRequest,
    acceptOrRejectPlanRequest
};
