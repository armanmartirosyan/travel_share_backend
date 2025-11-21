import mongoose, { Schema } from "mongoose";
import type { Model, Document, Types } from "mongoose";

export interface ITokens extends Document {
  _id: Types.ObjectId;
  userID: Types.ObjectId;
  refreshToken: string;
  expiresAt: Date;
}

const tokensSchema: Schema<ITokens> = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      default: (): Date => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      expires: 0,
    },
  },
  { timestamps: true },
);

const Tokens: Model<ITokens> = mongoose.model<ITokens>("Tokens", tokensSchema);

export { Tokens };
