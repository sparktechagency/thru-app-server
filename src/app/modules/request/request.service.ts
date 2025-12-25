import { JwtPayload } from "jsonwebtoken";
import { sendNotification } from "../../../helpers/notificationHelper";
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
      name: user.name,
      profile: user.profile,
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
    message: `Request sent to ${isRequestedPersonExist.name} ${isRequestedPersonExist.lastName}`,
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


      await Friend.create([{
        users: [isRequestExist.requestedBy._id, isRequestExist.requestedTo._id],
        requestId: isRequestExist._id
      }], { session });

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

const getMyFriendList = async (user: JwtPayload) => {
  const userId = new Types.ObjectId(user.authId);

  const friendRequests = await Request.find({
    $or: [
      { requestedBy: userId },
      { requestedTo: userId }
    ],
    status: REQUEST_STATUS.ACCEPTED
  })
    .populate<{ requestedBy: IUser }>('requestedBy', 'name lastName email profile status')
    .populate<{ requestedTo: IUser }>('requestedTo', 'name lastName email profile status') // Fixed: 'requestedTo'
    .sort({ updatedAt: -1 });


  const friends = friendRequests.map(request => {
    if (!request.requestedBy || !request.requestedTo) {

      return null;
    }

    const isRequester = request.requestedBy._id.equals(userId);
    const friend = isRequester ? request.requestedTo : request.requestedBy;

    return {
      id: friend._id,
      name: friend.name,
      lastName: friend.lastName,
      email: friend.email,
      profile: friend.profile,
      status: friend.status,
      friendshipDate: request.updatedAt,
      friendshipId: request._id,

    };
  }).filter(Boolean); // Remove null entries

  return friends;
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
  getMyFriendList,
  getMyFreindRequestList
}