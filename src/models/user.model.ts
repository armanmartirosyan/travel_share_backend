import mongoose, { Schema } from "mongoose";
import type { Model, Document, ValidatorProps } from "mongoose";

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  activationToken: string;
  profilePicture?: string;
  followers: Schema.Types.ObjectId[];
  following: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 4,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: (props: ValidatorProps): string => `${props.value} is not a valid email.`,
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true },
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export { User };
