import { Schema, model } from 'mongoose';
import { IFriend, FriendModel } from './friend.interface';

const friendSchema = new Schema<IFriend, FriendModel>({
  users: { type: [Schema.Types.ObjectId], ref: 'User' },
  requestId: { type: Schema.Types.ObjectId, ref: 'Request' },
  lastMessage: { type: String, default: 'Hello' },
  isLastMessageRead: { type: Boolean, default: false },
}, {
  timestamps: true
});

export const Friend = model<IFriend, FriendModel>('Friend', friendSchema);
