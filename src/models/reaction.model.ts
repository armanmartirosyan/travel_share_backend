import mongoose, { Schema } from "mongoose";
import type { Types, Model } from "mongoose";

export type ReactionType = "like" | "dislike";
export type ReactionTarget = "Post" | "Comment";

export interface IReaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: ReactionTarget;
  type: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema: Schema<IReaction> = new Schema<IReaction>(
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
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true },
);

ReactionSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

const ReactionModel: Model<IReaction> = mongoose.model<IReaction>("Reaction", ReactionSchema);

export { ReactionModel };
