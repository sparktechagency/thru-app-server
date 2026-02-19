"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendServices = void 0;
const mongoose_1 = require("mongoose");
const friend_model_1 = require("./friend.model");
const plan_model_1 = require("../plan/plan.model");
const request_model_1 = require("../request/request.model");
const request_interface_1 = require("../request/request.interface");
const getMyFriendList = async (user, filters) => {
    const userId = new mongoose_1.Types.ObjectId(user.authId);
    const { planId } = filters;
    // Fetch plan's friends array if planId is provided
    let planFriendIds = [];
    let planRequestSentToIds = [];
    if (planId) {
        const plan = await plan_model_1.Plan.findById(planId).select('collaborators').lean();
        if (plan && plan.collaborators) {
            planFriendIds = plan.collaborators.map((id) => id.toString());
        }
        // Fetch pending plan requests sent by the current user for this plan
        const pendingPlanRequests = await request_model_1.Request.find({
            requestedBy: userId,
            planId: new mongoose_1.Types.ObjectId(planId),
            type: request_interface_1.REQUEST_TYPE.PLAN,
            status: request_interface_1.REQUEST_STATUS.PENDING
        }).select('requestedTo').lean();
        planRequestSentToIds = pendingPlanRequests.map(req => req.requestedTo.toString());
    }
    // Find all friendships where the current user is involved
    const friendships = await friend_model_1.Friend.find({
        users: userId
    })
        .populate('users', 'name lastName email profile status')
        .populate('requestId', 'status createdAt')
        .sort({ createdAt: -1 }) // Most recent friends first
        .lean();
    // Transform the data to extract friend information
    const friends = friendships.map(friendship => {
        // Find the friend (the other user in the friendship)
        const friendUser = friendship.users.find((userDoc) => !userDoc._id.equals(userId));
        if (!friendUser) {
            return null;
        }
        // Check if this friend exists in the plan's friends array
        const isInPlan = planId ? planFriendIds.includes(friendUser._id.toString()) : false;
        // Check if a plan request has been sent to this friend
        const isPlanRequestSent = planId ? planRequestSentToIds.includes(friendUser._id.toString()) : false;
        return {
            _id: friendUser._id.toString(),
            name: friendUser.name,
            lastName: friendUser.lastName,
            email: friendUser.email,
            profile: friendUser.profile,
            friendshipId: friendship._id.toString(),
            isInPlan,
            isPlanRequestSent,
            lastMessage: friendship.lastMessage || "Hello",
            isLastMessageRead: friendship.isLastMessageRead || false,
            createdAt: friendship.createdAt,
            updatedAt: friendship.updatedAt
        };
    }).filter(Boolean); // Remove any null entries
    return friends;
};
exports.FriendServices = {
    getMyFriendList
};
