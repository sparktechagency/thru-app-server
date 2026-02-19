"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_service_1 = require("./user.service");
const pick_1 = __importDefault(require("../../../shared/pick"));
const pagination_1 = require("../../../interfaces/pagination");
const updateProfile = (0, catchAsync_1.default)(async (req, res) => {
    const { profilePicture, image, ...userData } = req.body;
    if (profilePicture) {
        userData.profile = profilePicture;
    }
    else if (image) {
        userData.profile = image;
    }
    const result = await user_service_1.UserServices.updateProfile(req.user, userData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Profile updated successfully',
        data: result,
    });
});
const uploadImages = (0, catchAsync_1.default)(async (req, res) => {
    const { images, type } = req.body;
    const result = await user_service_1.UserServices.uploadImages(req.user, { images, type });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Images uploaded successfully',
        data: result,
    });
});
const getUserProfile = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserServices.getUserProfile(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User profile retrieved successfully',
        data: result,
    });
});
const getUsers = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserServices.getUsers(req.user, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Users retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const getUserActivityLog = (0, catchAsync_1.default)(async (req, res) => {
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await user_service_1.UserServices.getUserActivityLog(req.user, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User activity log retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
exports.UserController = {
    uploadImages,
    updateProfile,
    getUserProfile,
    getUsers,
    getUserActivityLog
};
