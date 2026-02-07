import mongoose, { Schema } from "mongoose";
import type { Types, Document, Model } from "mongoose";

interface IComment extends Document {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  },
  { timestamps: true },
);

const Comment: Model<IComment> = mongoose.model<IComment>("Comments", CommentSchema);

export { Comment };
