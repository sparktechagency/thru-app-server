"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageServices = void 0;
const mongoose_1 = require("mongoose");
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const friend_model_1 = require("../friend/friend.model");
const message_model_1 = require("./message.model");
const socketInstances_1 = require("../../../helpers/socketInstances");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const plan_model_1 = require("../plan/plan.model");
const message_constants_1 = require("./message.constants");
const sendMessage = async (user, friendId, payload) => {
    if (!payload.message && (!payload.images || payload.images.length === 0)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Message content or at least one image is required');
    }
    const userId = new mongoose_1.Types.ObjectId(user.authId);
    const friendObjectId = new mongoose_1.Types.ObjectId(friendId);
    const friendship = await friend_model_1.Friend.findById(friendObjectId).populate('users');
    if (!friendship) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Friendship not found');
    }
    const userIds = friendship.users.map((u) => u._id.toString());
    if (!userIds.includes(userId.toString())) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to send messages in this conversation');
    }
    const receiver = friendship.users.find((u) => !u._id.equals(userId));
    if (!receiver) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to identify receiver');
    }
    const message = await message_model_1.Message.create({
        friend: friendObjectId,
        sender: userId,
        receiver: receiver._id,
        ...(payload.message && { message: payload.message }),
        ...(payload.images && { images: payload.images }),
        isRead: false,
    });
    const sender = friendship.users.find((u) => u._id.equals(userId));
    const returnableMessage = {
        _id: message._id,
        friend: message.friend,
        ...(message.message && { message: message.message }),
        ...(message.images && { images: message.images }),
        isRead: message.isRead,
        sender: {
            _id: userId,
            name: sender === null || sender === void 0 ? void 0 : sender.name,
            profile: sender === null || sender === void 0 ? void 0 : sender.profile,
        },
        receiver: {
            _id: receiver._id,
            name: receiver.name,
            profile: receiver.profile,
        },
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    };
    (0, socketInstances_1.emitEvent)(`message::${message.friend}`, returnableMessage);
    return returnableMessage;
};
const getMessagesByFriend = async (user, friendId, query) => {
    const userId = new mongoose_1.Types.ObjectId(user.authId);
    const friendObjectId = new mongoose_1.Types.ObjectId(friendId);
    const friendship = await friend_model_1.Friend.findById(friendObjectId).populate('users');
    if (!friendship) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Friendship not found');
    }
    const userIds = friendship.users.map((u) => u._id.toString());
    if (!userIds.includes(userId.toString())) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to view this conversation');
    }
    const messageQuery = new QueryBuilder_1.default(message_model_1.Message.find({ friend: friendObjectId }), query)
        .search(message_constants_1.messageSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await messageQuery.modelQuery
        .populate('sender', 'name profile')
        .populate('receiver', 'name profile');
    const meta = await messageQuery.getPaginationInfo();
    return {
        meta,
        data: result,
    };
};
const sendGroupMessage = async (user, planId, payload) => {
    if (!payload.message && (!payload.images || payload.images.length === 0)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Message content or at least one image is required');
    }
    const userId = new mongoose_1.Types.ObjectId(user.authId);
    const planObjectId = new mongoose_1.Types.ObjectId(planId);
    const plan = await plan_model_1.Plan.findById(planObjectId).select('createdBy collaborators');
    if (!plan) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Plan not found');
    }
    const isAuthorized = plan.createdBy.equals(userId) ||
        plan.collaborators.some(collabId => collabId.equals(userId));
    if (!isAuthorized) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to send messages in this group chat');
    }
    const message = await message_model_1.Message.create({
        plan: planObjectId,
        sender: userId,
        ...(payload.message && { message: payload.message }),
        ...(payload.images && { images: payload.images }),
    });
    const populatedMessage = await message_model_1.Message.findById(message._id)
        .populate('sender', 'name profile')
        .lean();
    const returnableMessage = {
        _id: message._id,
        plan: message.plan,
        ...(message.message && { message: message.message }),
        ...(message.images && { images: message.images }),
        isRead: message.isRead,
        sender: {
            _id: userId,
            name: populatedMessage === null || populatedMessage === void 0 ? void 0 : populatedMessage.sender.name,
            profile: populatedMessage === null || populatedMessage === void 0 ? void 0 : populatedMessage.sender.profile,
        },
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    };
    (0, socketInstances_1.emitEvent)(`message::${planId}`, returnableMessage);
    return returnableMessage;
};
const getMessagesByPlan = async (user, planId, query) => {
    const userId = new mongoose_1.Types.ObjectId(user.authId);
    const planObjectId = new mongoose_1.Types.ObjectId(planId);
    const plan = await plan_model_1.Plan.findById(planObjectId).select('createdBy collaborators');
    if (!plan) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Plan not found');
    }
    const isAuthorized = plan.createdBy.equals(userId) ||
        plan.collaborators.some(collabId => collabId.equals(userId));
    if (!isAuthorized) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to view this group chat');
    }
    const messageQuery = new QueryBuilder_1.default(message_model_1.Message.find({ plan: planObjectId }), query)
        .search(message_constants_1.messageSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await messageQuery.modelQuery
        .populate('sender', 'name profile');
    const meta = await messageQuery.getPaginationInfo();
    return {
        meta,
        data: result,
    };
};
const updateMessage = async (user, id, payload) => {
    const userId = new mongoose_1.Types.ObjectId(user.authId);
    const message = await message_model_1.Message.findById(id);
    if (!message) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Message not found');
    }
    const isAuthorized = message.sender.equals(userId) || user.role === 'ADMIN';
    if (!isAuthorized) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to edit this message');
    }
    const result = await message_model_1.Message.findByIdAndUpdate(id, { $set: { message: payload.message } }, { new: true, runValidators: true });
    return result;
};
const deleteMessage = async (user, id) => {
    const userId = new mongoose_1.Types.ObjectId(user.authId);
    const message = await message_model_1.Message.findById(id);
    if (!message) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Message not found');
    }
    const isAuthorized = message.sender.equals(userId) || user.role === 'ADMIN';
    if (!isAuthorized) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to delete this message');
    }
    const result = await message_model_1.Message.findByIdAndDelete(id);
    return result;
};
exports.MessageServices = {
    sendMessage,
    getMessagesByFriend,
    sendGroupMessage,
    getMessagesByPlan,
    updateMessage,
    deleteMessage,
};
