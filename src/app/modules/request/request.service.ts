import { JwtPayload } from "jsonwebtoken";
import { sendNotification } from "../../../helpers/notificationHelper";
import { emitEvent } from '../../../helpers/socketInstances';
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import mongoose, { ClientSession, Types } from "mongoose";
import { Request } from "./request.model";
import { User } from "../user/user.model";
import { USER_STATUS } from "../../../enum/user";
import { REQUEST_STATUS, REQUEST_TYPE } from "./request.interface";
import { IUser } from "../user/user.interface";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { Friend } from "../friend/friend.model";
import { Plan } from "../plan/plan.model";
import { IPlan } from "../plan/plan.interface";


interface FriendRequestPayload {
  status: REQUEST_STATUS;
}


const checkExistingRequest = async (user1: Types.ObjectId, user2: Types.ObjectId) => {
  return await Request.findOne({
    $or: [
      { requestedBy: user1, requestedTo: user2 },
      { requestedBy: user2, requestedTo: user1 }
    ],
    status: REQUEST_STATUS.PENDING
  });
};


const sendFriendRequest = async (user: JwtPayload, requestedTo: string) => {
  const requestedToObjectId = new Types.ObjectId(requestedTo);


  if (user.authId === requestedTo) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot send friend request to yourself");
  }

  const isRequestedPersonExist = await User.findById(requestedToObjectId)
    .select('_id name lastName email status')
    .lean();

  if (!isRequestedPersonExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "The requested person cannot be found");
  }


  if (isRequestedPersonExist.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot send request to this user");
  }

  const existingRequest = await checkExistingRequest(
    new Types.ObjectId(user.authId),
    requestedToObjectId
  );

  if (existingRequest) {
    throw new ApiError(StatusCodes.CONFLICT, "Friend request already exists");
  }


  const requestObject = {
    requestedBy: new Types.ObjectId(user.authId),
    requestedTo: requestedToObjectId,
    type: REQUEST_TYPE.FRIEND
  };

  const request = await Request.create(requestObject);

  if (!request) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to send friend request");
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



  await sendNotification(
    notificationPayload.from,
    notificationPayload.to.toString(),
    notificationPayload.title,
    notificationPayload.body,
    notificationPayload.friendRequestId.toString()


  );

  return {
    message: `Request sent to ${isRequestedPersonExist.name} `,
    requestId: request._id
  };
};


const sendPlanRequest = async (user: JwtPayload, requestedTo: string, planId: string) => {
  const requestedToObjectId = new Types.ObjectId(requestedTo);
  const planObjectId = new Types.ObjectId(planId);

  if (user.authId === requestedTo) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot send request to yourself");
  }

  const isRequestedPersonExist = await User.findById(requestedToObjectId).lean();
  if (!isRequestedPersonExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "The requested person cannot be found");
  }

  const plan = await Plan.findById(planObjectId);
  if (!plan) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Plan not found");
  }

  // Check if already in plan
  const isAlreadyInPlan = plan.collaborators.some(collaboratorId => collaboratorId.toString() === user.authId.toString()) ||
    plan.createdBy.toString() === user.authId.toString();

  if (isAlreadyInPlan && plan.createdBy.equals(new Types.ObjectId(user.authId))) {
    // If owner is sending, check if requestedTo is already in plan
    const isTargetAlreadyInPlan = plan.collaborators.some(collaboratorId => collaboratorId.toString() === requestedToObjectId.toString());
    if (isTargetAlreadyInPlan) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User is already in this plan");
    }
  } else if (isAlreadyInPlan) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You are already a member of this plan");
  }

  const existingRequest = await Request.findOne({
    requestedBy: user.authId,
    requestedTo: requestedToObjectId,
    planId: planObjectId,
    status: REQUEST_STATUS.PENDING
  });

  if (existingRequest) {
    throw new ApiError(StatusCodes.CONFLICT, "Plan request already exists");
  }

  const request = await Request.create({
    requestedBy: user.authId,
    requestedTo: requestedToObjectId,
    planId: planObjectId,
    type: REQUEST_TYPE.PLAN
  });

  const isOwnerSending = plan.createdBy.toString() === user.authId.toString();
  const notificationTitle = isOwnerSending ? "Plan Invitation" : "New Plan Request";
  const notificationBody = isOwnerSending
    ? `${user.name} invited you to join the plan: ${plan.title}`
    : `${user.name} wants to join your plan: ${plan.title}`;

  await sendNotification(
    { authId: user.authId, name: user.name, profile: user.profile },
    requestedTo,
    notificationTitle,
    notificationBody,
    undefined,
    request._id.toString()
  );

  return {
    message: isOwnerSending ? "Invitation sent" : "Request sent",
    requestId: request._id
  };
};



const acceptOrRejectRequest = async (
  user: JwtPayload,
  payload: FriendRequestPayload,
  requestId: string
) => {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const requestObjectId = new Types.ObjectId(requestId);
    const currentUserId = new Types.ObjectId(user.authId);


    const isRequestExist = await Request.findById(requestObjectId)
      .populate('requestedBy', 'name lastName profile')
      .populate('requestedTo', 'name lastName profile')
      .session(session);

    if (!isRequestExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Request not found");
    }

    if (!isRequestExist.requestedTo._id.equals(currentUserId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized to respond to this request");
    }

    if (isRequestExist.status !== REQUEST_STATUS.PENDING) {
      throw new ApiError(StatusCodes.CONFLICT, `Request already ${isRequestExist.status}`);
    }


    isRequestExist.status = payload.status;
    await isRequestExist.save({ session });


    if (payload.status === REQUEST_STATUS.ACCEPTED) {
      const existingFriendship = await Friend.findOne({
        users: {
          $all: [isRequestExist.requestedBy._id, isRequestExist.requestedTo._id]
        }
      }).session(session);

      if (existingFriendship) {
        throw new ApiError(StatusCodes.CONFLICT, "Friendship already exists");
      }


      const newFriendship = await Friend.create([{
        users: [isRequestExist.requestedBy._id, isRequestExist.requestedTo._id],
        requestId: isRequestExist._id
      }], { session });

      // Prepare friend data for requestedBy (they see requestedTo as their friend)
      const requestedBy = isRequestExist.requestedBy as unknown as IUser;
      const requestedTo = isRequestExist.requestedTo as unknown as IUser;

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
      emitEvent(`newChat::${requestedBy._id}`, friendDataForRequestedBy);
      emitEvent(`newChat::${requestedTo._id}`, friendDataForRequestedTo);
    }


    await session.commitTransaction();


    if (payload.status === REQUEST_STATUS.ACCEPTED) {
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

      await sendNotification(
        notificationPayload.from,
        notificationPayload.to.toString(),
        notificationPayload.title,
        notificationPayload.body,

      );
    }

    return {
      message: `Friend request ${payload.status.toLowerCase()}`,
      status: payload.status,
      requestId: requestId
    };

  } catch (error) {

    await session.abortTransaction();

    if (error instanceof ApiError) {
      throw error;
    }

    console.error('Error in acceptOrRejectRequest:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to process friend request"
    );
  } finally {

    await session.endSession();
  }
};


const acceptOrRejectPlanRequest = async (
  user: JwtPayload,
  payload: FriendRequestPayload,
  requestId: string
) => {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const requestObjectId = new Types.ObjectId(requestId);
    const currentUserId = new Types.ObjectId(user.authId);

    const isRequestExist = await Request.findById(requestObjectId).session(session);

    if (!isRequestExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Request not found");
    }

    if (isRequestExist.requestedTo.toString() !== currentUserId.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized to respond to this request");
    }

    if (isRequestExist.status !== REQUEST_STATUS.PENDING) {
      throw new ApiError(StatusCodes.CONFLICT, `Request already ${isRequestExist.status}`);
    }
    console.log(isRequestExist, "isRequestExist", payload);
    // isRequestExist.status = payload.status;
    await isRequestExist.save({ session });

    if (payload.status === REQUEST_STATUS.ACCEPTED) {
      const plan = await Plan.findById(isRequestExist.planId).session(session);
      if (!plan) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Plan not found");
      }

      // Determine who to add to the plan friends list
      // If the owner requested someone, add the requested person.
      // If someone requested the owner, add the requester.
      const ownerId = plan.createdBy;
      const joinerId = isRequestExist.requestedBy.toString() === ownerId.toString()
        ? isRequestExist.requestedTo
        : isRequestExist.requestedBy;

      await Plan.findByIdAndUpdate(
        plan._id,
        { $addToSet: { collaborators: joinerId } },
        { session, new: true }
      );
    }

    await session.commitTransaction();

    if (payload.status === REQUEST_STATUS.ACCEPTED) {
      await sendNotification(
        { authId: user.authId, name: user.name, profile: user.profile },
        isRequestExist.requestedBy.toString(),
        "Plan Request Accepted",
        `${user.name} accepted the plan request`
      );
    }

    return {
      message: `Plan request ${payload.status.toLowerCase()}`,
      status: payload.status,
      requestId: requestId
    };

  } catch (error) {
    await session.abortTransaction();
    // console.error('Error in acceptOrRejectPlanRequest:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to process plan request");
  } finally {
    await session.endSession();
  }
};



const getMyFreindRequestList = async (user: JwtPayload, paginationOptions: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(paginationOptions);
  const [requests, total] = await Promise.all([
    Request.find({
      requestedTo: user.authId
    }).populate<{ requestedBy: IUser }>('requestedBy', 'name lastName email profile status').skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }).lean(),
    Request.countDocuments({ requestedTo: user.authId })
  ])

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: requests,
  }
}

export const RequestService = {
  sendFriendRequest,
  acceptOrRejectRequest,
  getMyFreindRequestList,
  sendPlanRequest,
  acceptOrRejectPlanRequest
}