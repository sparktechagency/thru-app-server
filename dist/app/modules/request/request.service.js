"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestService = void 0;
const notificationHelper_1 = require("../../../helpers/notificationHelper");
const socketInstances_1 = require("../../../helpers/socketInstances");
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const mongoose_1 = __importStar(require("mongoose"));
const request_model_1 = require("./request.model");
const user_model_1 = require("../user/user.model");
const user_1 = require("../../../enum/user");
const request_interface_1 = require("./request.interface");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const friend_model_1 = require("../friend/friend.model");
const plan_model_1 = require("../plan/plan.model");
const checkExistingRequest = async (user1, user2) => {
    return await request_model_1.Request.findOne({
        $or: [
            { requestedBy: user1, requestedTo: user2 },
            { requestedBy: user2, requestedTo: user1 }
        ],
        status: request_interface_1.REQUEST_STATUS.PENDING
    });
};
const sendFriendRequest = async (user, requestedTo) => {
    const requestedToObjectId = new mongoose_1.Types.ObjectId(requestedTo);
    if (user.authId === requestedTo) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot send friend request to yourself");
    }
    const isRequestedPersonExist = await user_model_1.User.findById(requestedToObjectId)
        .select('_id name lastName email status')
        .lean();
    if (!isRequestedPersonExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "The requested person cannot be found");
    }
    if (isRequestedPersonExist.status !== user_1.USER_STATUS.ACTIVE) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot send request to this user");
    }
    const existingRequest = await checkExistingRequest(new mongoose_1.Types.ObjectId(user.authId), requestedToObjectId);
    if (existingRequest) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, "Friend request already exists");
    }
    const requestObject = {
        requestedBy: new mongoose_1.Types.ObjectId(user.authId),
        requestedTo: requestedToObjectId,
        type: request_interface_1.REQUEST_TYPE.FRIEND
    };
    const request = await request_model_1.Request.create(requestObject);
    if (!request) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to send friend request");
    }
    const notificationPayload = {
        from: {
            authId: user.authId,
            name: user.name || "",
            profile: user.profile || "",
        },
        to: isRequestedPersonExist._id,
        title: "New Friend Request",
        body: `${user.name} ${user.lastName} sent you a friend request`,
        friendRequestId: request._id
    };
    await (0, notificationHelper_1.sendNotification)(notificationPayload.from, notificationPayload.to.toString(), notificationPayload.title, notificationPayload.body, notificationPayload.friendRequestId.toString());
    return {
        message: `Request sent to ${isRequestedPersonExist.name} `,
        requestId: request._id
    };
};
const sendPlanRequest = async (user, requestedTo, planId) => {
    const requestedToObjectId = new mongoose_1.Types.ObjectId(requestedTo);
    const planObjectId = new mongoose_1.Types.ObjectId(planId);
    if (user.authId === requestedTo) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot send request to yourself");
    }
    const isRequestedPersonExist = await user_model_1.User.findById(requestedToObjectId).lean();
    if (!isRequestedPersonExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "The requested person cannot be found");
    }
    const plan = await plan_model_1.Plan.findById(planObjectId);
    if (!plan) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Plan not found");
    }
    // Check if already in plan
    const isAlreadyInPlan = plan.collaborators.some(collaboratorId => collaboratorId.toString() === user.authId.toString()) ||
        plan.createdBy.toString() === user.authId.toString();
    if (isAlreadyInPlan && plan.createdBy.equals(new mongoose_1.Types.ObjectId(user.authId))) {
        // If owner is sending, check if requestedTo is already in plan
        const isTargetAlreadyInPlan = plan.collaborators.some(collaboratorId => collaboratorId.toString() === requestedToObjectId.toString());
        if (isTargetAlreadyInPlan) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is already in this plan");
        }
    }
    else if (isAlreadyInPlan) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You are already a member of this plan");
    }
    const existingRequest = await request_model_1.Request.findOne({
        requestedBy: user.authId,
        requestedTo: requestedToObjectId,
        planId: planObjectId,
        status: request_interface_1.REQUEST_STATUS.PENDING
    });
    if (existingRequest) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, "Plan request already exists");
    }
    const request = await request_model_1.Request.create({
        requestedBy: user.authId,
        requestedTo: requestedToObjectId,
        planId: planObjectId,
        type: request_interface_1.REQUEST_TYPE.PLAN
    });
    const isOwnerSending = plan.createdBy.toString() === user.authId.toString();
    const notificationTitle = isOwnerSending ? "Plan Invitation" : "New Plan Request";
    const notificationBody = isOwnerSending
        ? `${user.name} invited you to join the plan: ${plan.title}`
        : `${user.name} wants to join your plan: ${plan.title}`;
    await (0, notificationHelper_1.sendNotification)({ authId: user.authId, name: user.name, profile: user.profile }, requestedTo, notificationTitle, notificationBody, undefined, request._id.toString());
    return {
        message: isOwnerSending ? "Invitation sent" : "Request sent",
        requestId: request._id
    };
};
const acceptOrRejectRequest = async (user, payload, requestId) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const requestObjectId = new mongoose_1.Types.ObjectId(requestId);
        const currentUserId = new mongoose_1.Types.ObjectId(user.authId);
        const isRequestExist = await request_model_1.Request.findById(requestObjectId)
            .populate('requestedBy', 'name lastName profile')
            .populate('requestedTo', 'name lastName profile')
            .session(session);
        if (!isRequestExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Request not found");
        }
        if (!isRequestExist.requestedTo._id.equals(currentUserId)) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Not authorized to respond to this request");
        }
        if (isRequestExist.status !== request_interface_1.REQUEST_STATUS.PENDING) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, `Request already ${isRequestExist.status}`);
        }
        isRequestExist.status = payload.status;
        await isRequestExist.save({ session });
        if (payload.status === request_interface_1.REQUEST_STATUS.ACCEPTED) {
            const existingFriendship = await friend_model_1.Friend.findOne({
                users: {
                    $all: [isRequestExist.requestedBy._id, isRequestExist.requestedTo._id]
                }
            }).session(session);
            if (existingFriendship) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, "Friendship already exists");
            }
            const newFriendship = await friend_model_1.Friend.create([{
                    users: [isRequestExist.requestedBy._id, isRequestExist.requestedTo._id],
                    requestId: isRequestExist._id
                }], { session });
            // Prepare friend data for requestedBy (they see requestedTo as their friend)
            const requestedBy = isRequestExist.requestedBy;
            const requestedTo = isRequestExist.requestedTo;
            const friendDataForRequestedBy = {
                _id: requestedTo._id.toString(),
                name: requestedTo.name,
                lastName: requestedTo.lastName,
                profile: requestedTo.profile,
                friendshipId: newFriendship[0]._id.toString(),
                isInPlan: false,
                isPlanRequestSent: false,
                lastMessage: "Hello",
                isLastMessageRead: false,
                createdAt: newFriendship[0].createdAt,
                updatedAt: newFriendship[0].updatedAt
            };
            const friendDataForRequestedTo = {
                _id: requestedBy._id.toString(),
                name: requestedBy.name,
                lastName: requestedBy.lastName,
                profile: requestedBy.profile,
                friendshipId: newFriendship[0]._id.toString(),
                isInPlan: false,
                isPlanRequestSent: false,
                lastMessage: "Hello",
                isLastMessageRead: false,
                createdAt: newFriendship[0].createdAt,
                updatedAt: newFriendship[0].updatedAt
            };
            // Emit newChat event to both users
            (0, socketInstances_1.emitEvent)(`newChat::${requestedBy._id}`, friendDataForRequestedBy);
            (0, socketInstances_1.emitEvent)(`newChat::${requestedTo._id}`, friendDataForRequestedTo);
        }
        await session.commitTransaction();
        if (payload.status === request_interface_1.REQUEST_STATUS.ACCEPTED) {
            const notificationPayload = {
                from: {
                    authId: user.authId,
                    name: user.name,
                    profile: user.profile,
                },
                to: isRequestExist.requestedBy._id,
                title: "Friend Request Accepted",
                body: `${user.name} ${user.lastName} accepted your friend request`,
            };
            await (0, notificationHelper_1.sendNotification)(notificationPayload.from, notificationPayload.to.toString(), notificationPayload.title, notificationPayload.body);
        }
        return {
            message: `Friend request ${payload.status.toLowerCase()}`,
            status: payload.status,
            requestId: requestId
        };
    }
    catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        console.error('Error in acceptOrRejectRequest:', error);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to process friend request");
    }
    finally {
        await session.endSession();
    }
};
const acceptOrRejectPlanRequest = async (user, payload, requestId) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const requestObjectId = new mongoose_1.Types.ObjectId(requestId);
        const currentUserId = new mongoose_1.Types.ObjectId(user.authId);
        const isRequestExist = await request_model_1.Request.findById(requestObjectId).session(session);
        if (!isRequestExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Request not found");
        }
        if (isRequestExist.requestedTo.toString() !== currentUserId.toString()) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Not authorized to respond to this request");
        }
        if (isRequestExist.status !== request_interface_1.REQUEST_STATUS.PENDING) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, `Request already ${isRequestExist.status}`);
        }
        console.log(isRequestExist, "isRequestExist", payload);
        // isRequestExist.status = payload.status;
        await isRequestExist.save({ session });
        if (payload.status === request_interface_1.REQUEST_STATUS.ACCEPTED) {
            const plan = await plan_model_1.Plan.findById(isRequestExist.planId).session(session);
            if (!plan) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Plan not found");
            }
            // Determine who to add to the plan friends list
            // If the owner requested someone, add the requested person.
            // If someone requested the owner, add the requester.
            const ownerId = plan.createdBy;
            const joinerId = isRequestExist.requestedBy.toString() === ownerId.toString()
                ? isRequestExist.requestedTo
                : isRequestExist.requestedBy;
            await plan_model_1.Plan.findByIdAndUpdate(plan._id, { $addToSet: { collaborators: joinerId } }, { session, new: true });
        }
        await session.commitTransaction();
        if (payload.status === request_interface_1.REQUEST_STATUS.ACCEPTED) {
            await (0, notificationHelper_1.sendNotification)({ authId: user.authId, name: user.name, profile: user.profile }, isRequestExist.requestedBy.toString(), "Plan Request Accepted", `${user.name} accepted the plan request`);
        }
        return {
            message: `Plan request ${payload.status.toLowerCase()}`,
            status: payload.status,
            requestId: requestId
        };
    }
    catch (error) {
        await session.abortTransaction();
        // console.error('Error in acceptOrRejectPlanRequest:', error);
        if (error instanceof ApiError_1.default)
            throw error;
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to process plan request");
    }
    finally {
        await session.endSession();
    }
};
const getMyFreindRequestList = async (user, paginationOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const [requests, total] = await Promise.all([
        request_model_1.Request.find({
            requestedTo: user.authId
        }).populate('requestedBy', 'name lastName email profile status').skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder }).lean(),
        request_model_1.Request.countDocuments({ requestedTo: user.authId })
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: requests,
    };
};
exports.RequestService = {
    sendFriendRequest,
    acceptOrRejectRequest,
    getMyFreindRequestList,
    sendPlanRequest,
    acceptOrRejectPlanRequest
};
