import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { Friend } from "./friend.model";
import { IUser } from "../user/user.interface";

const getMyFriendList = async (user: JwtPayload) => {
  const userId = new Types.ObjectId(user.authId);

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

    return {
      _id: friendUser._id.toString(),
      name: friendUser.name,
      lastName: friendUser.lastName,
      email: friendUser.email,
      profile: friendUser.profile,
      friendshipId: friendship._id.toString(),
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt
    };
  }).filter(Boolean); // Remove any null entries

  return friends;
};


export const FriendServices = {
  getMyFriendList
}