"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const plan_model_1 = require("./plan.model");
const plan_constants_1 = require("./plan.constants");
const mongoose_1 = require("mongoose");
const remove_1 = __importDefault(require("../../../helpers/image/remove"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const user_model_1 = require("../user/user.model");
const createPlan = async (user, payload) => {
    try {
        payload.createdBy = user.authId;
        payload.collaborators = [user.authId];
        const result = await plan_model_1.Plan.create(payload);
        if (!result) {
            if (payload.images && payload.images.length > 0) {
                (0, remove_1.default)(payload.images);
            }
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Plan, please try again with valid data.');
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
const getAllPlans = async (user, query) => {
    const planQuery = new QueryBuilder_1.default(plan_model_1.Plan.find({
        $or: [{ createdBy: user.authId }, { collaborators: user.authId }],
    }), query)
        .search(plan_constants_1.planSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await planQuery.modelQuery
        .populate('createdBy', 'name lastName profile')
        .populate('collaborators', 'name lastName profile');
    const meta = await planQuery.getPaginationInfo();
    return {
        meta,
        data: result,
    };
};
const getHistoryPlans = async (user, query) => {
    const currentDate = new Date();
    const planQuery = new QueryBuilder_1.default(plan_model_1.Plan.find({
        $and: [
            {
                $or: [{ createdBy: user.authId }, { collaborators: user.authId }]
            },
            {
                endDate: { $lt: currentDate }
            }
        ]
    }), query).search(plan_constants_1.planSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await planQuery.modelQuery
        .populate('createdBy', 'name lastName profile')
        .populate('collaborators', 'name lastName profile');
    const meta = await planQuery.getPaginationInfo();
    return { data: result, meta };
};
const getSinglePlan = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
    }
    const result = await plan_model_1.Plan.findById(id)
        .populate('createdBy', 'name lastName fullName profile')
        .populate('collaborators', 'name lastName fullName profile');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested plan not found, please try again with valid id');
    }
    return result;
};
const updatePlan = async (id, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
    }
    const result = await plan_model_1.Plan.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: payload }, {
        new: true,
        runValidators: true,
    })
        .populate('createdBy', 'name lastName fullName profile')
        .populate('collaborators', 'name lastName fullName profile');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested plan not found, please try again with valid id');
    }
    return result;
};
const deletePlan = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
    }
    const result = await plan_model_1.Plan.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting plan, please try again with valid id.');
    }
    // Remove associated files
    if (result.images && result.images.length > 0) {
        (0, remove_1.default)(result.images);
    }
    return result;
};
const addPlanCollaborator = async (planId, userId, requesterId) => {
    if (!mongoose_1.Types.ObjectId.isValid(planId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
    }
    const session = await plan_model_1.Plan.startSession();
    try {
        session.startTransaction();
        const plan = await plan_model_1.Plan.findById(planId).session(session);
        if (!plan) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested plan not found');
        }
        const result = await plan_model_1.Plan.findByIdAndUpdate(planId, { $addToSet: { collaborators: userId } }, { new: true, runValidators: true, session });
        if (!result) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested plan not found');
        }
        const planIncludedInUser = await user_model_1.User.findByIdAndUpdate(userId, { $addToSet: { includedPlans: planId } }, { new: true, runValidators: true, session });
        if (!planIncludedInUser) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested user not found to include plan');
        }
        await session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
const removePlanCollaborator = async (planId, userId, requesterId) => {
    if (!mongoose_1.Types.ObjectId.isValid(planId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Plan ID');
    }
    const session = await plan_model_1.Plan.startSession();
    try {
        session.startTransaction();
        const plan = await plan_model_1.Plan.findById(planId).session(session);
        if (!plan) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested plan not found');
        }
        const result = await plan_model_1.Plan.findByIdAndUpdate(planId, { $pull: { collaborators: userId } }, { new: true, runValidators: true, session });
        if (!result) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested plan not found');
        }
        const planRemovedFromUser = await user_model_1.User.findByIdAndUpdate(userId, { $pull: { includedPlans: planId } }, { new: true, runValidators: true, session });
        if (!planRemovedFromUser) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested user not found to remove plan');
        }
        await session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
exports.PlanServices = {
    createPlan,
    getAllPlans,
    getSinglePlan,
    updatePlan,
    deletePlan,
    addPlanCollaborator,
    removePlanCollaborator,
    getHistoryPlans
};
