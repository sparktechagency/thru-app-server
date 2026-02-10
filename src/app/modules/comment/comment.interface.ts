import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IPost } from '../post/post.interface';

export interface IComment {
    _id: Types.ObjectId;
    commentedBy: Types.ObjectId | IUser;
    postId: Types.ObjectId | IPost;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CommentModel = Model<IComment, {}, {}>;
