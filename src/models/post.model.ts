import mongoose, { Schema } from "mongoose";
import { MediaSchema } from "./media.model.js";
import type { IMedia } from "./media.model.js";
import type { Types, Document, Model } from "mongoose";

export interface IPost extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  description?: string;
  media: IMedia[];
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    media: {
      type: [MediaSchema],
      validate: {
        validator: (v: any[]): boolean => v.length <= 5,
        message: "Post can have at most 5 media items",
      },
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

const Post: Model<IPost> = mongoose.model<IPost>("Post", PostSchema);

export { Post };
