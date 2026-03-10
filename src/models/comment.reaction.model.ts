import mongoose, { Schema } from "mongoose";
import type { Types, Document, Model } from "mongoose";

export type CommentReactionType = "like" | "dislike";

export interface ICommentReaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetId: Types.ObjectId;
  type: CommentReactionType;
  createdAt: Date;
  updatedAt: Date;
}

const CommentReactionSchema: Schema<ICommentReaction> = new Schema<ICommentReaction>(
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

CommentReactionSchema.index({ userId: 1, targetId: 1 }, { unique: true });

const CommentReactionModel: Model<ICommentReaction> = mongoose.model<ICommentReaction>(
  "CommentReaction",
  CommentReactionSchema,
);

export { CommentReactionModel };
