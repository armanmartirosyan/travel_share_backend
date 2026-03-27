import mongoose, { Schema } from "mongoose";
import type { Types, Document, Model } from "mongoose";

export interface ICommentUser {
  _id: Types.ObjectId;
  username: string;
  profilePicture?: string;
}

export interface IComment extends Document {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  user: ICommentUser;
  parentId?: Types.ObjectId; // Reference to parent comment (null for top-level comments)
  content: string;
  likeCount: number;
  dislikeCount: number;
  replies: Types.ObjectId[]; // Array of child comment IDs
  createdAt: Date;
  updatedAt: Date;
  userReaction: "like" | "dislike" | null;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comments",
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    dislikeCount: {
      type: Number,
      default: 0,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comments",
        default: [],
      },
    ],
  },
  { timestamps: true },
);

const Comment: Model<IComment> = mongoose.model<IComment>("Comments", CommentSchema);

export { Comment };
