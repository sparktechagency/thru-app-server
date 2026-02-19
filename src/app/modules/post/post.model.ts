import { Schema, model } from 'mongoose';
import { IPost, PostModel } from './post.interface';

const postSchema = new Schema<IPost, PostModel>(
    {
        title: { type: String, required: true },
        images: { type: [String] },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        commentCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

export const Post = model<IPost, PostModel>('Post', postSchema);
