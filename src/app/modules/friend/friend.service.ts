import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { Friend } from "./friend.model";
import { IUser } from "../user/user.interface";
import { Plan } from "../plan/plan.model";
import { Request } from "../request/request.model";
import { REQUEST_STATUS, REQUEST_TYPE } from "../request/request.interface";

const getMyFriendList = async (user: JwtPayload, filters: any) => {
  const userId = new Types.ObjectId(user.authId);
  const { planId } = filters;

  // Fetch plan's friends array if planId is provided
  let planFriendIds: string[] = [];
  let planRequestSentToIds: string[] = [];

  if (planId) {
    const plan = await Plan.findById(planId).select('friends').lean();
    if (plan && plan.friends) {
      planFriendIds = plan.friends.map((id: Types.ObjectId) => id.toString());
    }

    // Fetch pending plan requests sent by the current user for this plan
    const pendingPlanRequests = await Request.find({
      requestedBy: userId,
      planId: new Types.ObjectId(planId),
      type: REQUEST_TYPE.PLAN,
      status: REQUEST_STATUS.PENDING
    }).select('requestedTo').lean();

    planRequestSentToIds = pendingPlanRequests.map(req => req.requestedTo.toString());
  }

  // Find all friendships where the current user is involved
  const friendships = await Friend.find({
    users: userId
  })
    .populate<{ users: IUser[] }>('users', 'name lastName email profile status')
    .populate<{ requestId: any }>('requestId', 'status createdAt')
    .sort({ createdAt: -1 }) // Most recent friends first
    .lean();

  // Transform the data to extract friend information
  const friends = friendships.map(friendship => {
    // Find the friend (the other user in the friendship)
    const friendUser = friendship.users.find(
      (userDoc: IUser) => !userDoc._id.equals(userId)
    );

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


export const FriendServices = {
  getMyFriendList
}