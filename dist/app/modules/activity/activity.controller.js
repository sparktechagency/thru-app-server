"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const activity_service_1 = require("./activity.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const createActivity = (0, catchAsync_1.default)(async (req, res) => {
    const result = await activity_service_1.ActivityServices.createActivity(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Activity created successfully',
        data: result,
    });
});
const getAllActivities = (0, catchAsync_1.default)(async (req, res) => {
    const result = await activity_service_1.ActivityServices.getAllActivities(req.user, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Activities retrieved successfully',
        data: result.data,
    });
});
const getSingleActivity = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await activity_service_1.ActivityServices.getSingleActivity(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Activity retrieved successfully',
        data: result,
    });
});
const updateActivity = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await activity_service_1.ActivityServices.updateActivity(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Activity updated successfully',
        data: result,
    });
});
const deleteActivity = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await activity_service_1.ActivityServices.deleteActivity(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Activity deleted successfully',
        data: result,
    });
});
exports.ActivityController = {
    createActivity,
    getAllActivities,
    getSingleActivity,
    updateActivity,
    deleteActivity,
};
