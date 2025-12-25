import { Schema, model } from 'mongoose';
import { IComment, CommentModel } from './comment.interface';

const commentSchema = new Schema<IComment, CommentModel>({
    commentedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    content: { type: String, required: true },
}, {
    timestamps: true
});

export const Comment = model<IComment, CommentModel>('Comment', commentSchema);
