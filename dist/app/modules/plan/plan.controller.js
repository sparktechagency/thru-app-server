"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const plan_service_1 = require("./plan.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const createPlan = (0, catchAsync_1.default)(async (req, res) => {
    const result = await plan_service_1.PlanServices.createPlan(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Plan created successfully',
        data: result,
    });
});
const updatePlan = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await plan_service_1.PlanServices.updatePlan(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Plan updated successfully',
        data: result,
    });
});
const getSinglePlan = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await plan_service_1.PlanServices.getSinglePlan(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Plan retrieved successfully',
        data: result,
    });
});
const getAllPlans = (0, catchAsync_1.default)(async (req, res) => {
    const result = await plan_service_1.PlanServices.getAllPlans(req.user, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Plans retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
const getHistoryPlans = (0, catchAsync_1.default)(async (req, res) => {
    const result = await plan_service_1.PlanServices.getHistoryPlans(req.user, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'My created plans retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
const deletePlan = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await plan_service_1.PlanServices.deletePlan(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Plan deleted successfully',
        data: result,
    });
});
const addPlanCollaborator = (0, catchAsync_1.default)(async (req, res) => {
    const { planId, userId } = req.body;
    const result = await plan_service_1.PlanServices.addPlanCollaborator(planId, userId, req.user.authId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Collaborator added to plan successfully',
        data: result,
    });
});
const removePlanCollaborator = (0, catchAsync_1.default)(async (req, res) => {
    const { planId, userId } = req.body;
    const result = await plan_service_1.PlanServices.removePlanCollaborator(planId, userId, req.user.authId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Collaborator removed from plan successfully',
        data: result,
    });
});
exports.PlanController = {
    createPlan,
    updatePlan,
    getSinglePlan,
    getAllPlans,
    deletePlan,
    addPlanCollaborator,
    removePlanCollaborator,
    getHistoryPlans
};
