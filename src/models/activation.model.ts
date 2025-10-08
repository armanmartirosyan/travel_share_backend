import mongoose, { Schema } from "mongoose";
import type { Model, Document, Types } from "mongoose";

export interface IActivationToken extends Document {
  _id: Types.ObjectId;
  activationToken: string;
  userId: Types.ObjectId;
  expireAt: Date;
}

const ActivationTokenSchema: Schema<IActivationToken> = new Schema({
  activationToken: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  expireAt: {
    type: Date,
    default: (): Date => new Date(Date.now() + 24 * 60 * 60 * 1000),
    expires: 0,
  },
});

const ActivationToken: Model<IActivationToken> = mongoose.model<IActivationToken>(
  "ActivationTokens",
  ActivationTokenSchema,
);

export { ActivationToken };
