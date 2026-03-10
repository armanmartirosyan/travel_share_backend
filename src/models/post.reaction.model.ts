import mongoose, { Schema } from "mongoose";
import type { Types, Document, Model } from "mongoose";

export type PostReactionType = "like" | "dislike";

export interface IPostReaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetId: Types.ObjectId;
  type: PostReactionType;
  createdAt: Date;
  updatedAt: Date;
}

const PostReactionSchema: Schema<IPostReaction> = new Schema<IPostReaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true },
);

PostReactionSchema.index({ userId: 1, targetId: 1 }, { unique: true });

const PostReactionModel: Model<IPostReaction> = mongoose.model<IPostReaction>(
  "PostReaction",
  PostReactionSchema,
);

export { PostReactionModel };
