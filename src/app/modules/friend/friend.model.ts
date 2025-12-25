import { Schema, model } from 'mongoose';
import { IFriend, FriendModel } from './friend.interface';

const friendSchema = new Schema<IFriend, FriendModel>({
  users: { type: [Schema.Types.ObjectId], ref: 'User' },
  requestId: { type: Schema.Types.ObjectId, ref: 'Request' },
}, {
  timestamps: true
});

export const Friend = model<IFriend, FriendModel>('Friend', friendSchema);
