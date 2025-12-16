import mongoose, { Schema } from "mongoose";
import type { Model, Document, ValidatorProps, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  name?: string;
  surname?: string;
  password: string;
  isActive: boolean;
  profilePicture?: string;
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
    name: {
      type: String,
      trim: true,
    },
    surname: {
      type: String,
      trim: true,
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
    profilePicture: {
      type: String,
    },
  },
  { timestamps: true },
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export { User };
