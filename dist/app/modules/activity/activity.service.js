"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const activity_model_1 = require("./activity.model");
const mongoose_1 = require("mongoose");
const remove_1 = __importDefault(require("../../../helpers/image/remove"));
const activity_constants_1 = require("./activity.constants");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const plan_model_1 = require("../plan/plan.model");
const createActivity = async (user, payload) => {
    try {
        payload.createdBy = user.authId;
        const isPlanExist = await plan_model_1.Plan.findById(payload.planId);
        if (!isPlanExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid planId, please try again with valid planId');
        }
        const result = await activity_model_1.Activity.create(payload);
        if (!result) {
            if (payload.images && payload.images.length > 0) {
                (0, remove_1.default)(payload.images);
            }
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Activity, please try again with valid data.');
        }
        return result;
    }
    catch (error) {
        if (payload.images && payload.images.length > 0) {
            (0, remove_1.default)(payload.images);
        }
        if (error.code === 11000) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Duplicate entry found');
        }
        throw error;
    }
};
const getAllActivities = async (user, query) => {
    if (!query.category || !query.planId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Category and planId are required to fetch activities');
    }
    const activityQuery = new QueryBuilder_1.default(activity_model_1.Activity.find(), query)
        .search(activity_constants_1.activitySearchableFields)
        .filter()
        .sort()
        .fields();
    const result = await activityQuery.modelQuery;
    return {
        data: result,
    };
};
const getSingleActivity = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Activity ID');
    }
    const result = await activity_model_1.Activity.findById(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested activity not found, please try again with valid id');
    }
    return result;
};
const updateActivity = async (id, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Activity ID');
    }
    const result = await activity_model_1.Activity.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: payload }, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested activity not found, please try again with valid id');
    }
    return result;
};
const deleteActivity = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Activity ID');
    }
    const result = await activity_model_1.Activity.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting activity, please try again with valid id.');
    }
    if (result.images && result.images.length > 0) {
        (0, remove_1.default)(result.images);
    }
    return result;
};
exports.ActivityServices = {
    createActivity,
    getAllActivities,
    getSingleActivity,
    updateActivity,
    deleteActivity,
};
