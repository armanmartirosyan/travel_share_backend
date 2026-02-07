import { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IMedia extends Document {
  type: "image" | "video";
  url: string;
}

const MediaSchema: Schema<IMedia> = new Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { _id: false },
);

export { MediaSchema };
