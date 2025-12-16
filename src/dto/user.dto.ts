import type { IUser } from "../models/user.model.js";
import type { AuthResponse } from "../types/index.js";

class UserDTO {
  _id: string;
  username: string;
  email: string;
  name?: string;
  surname?: string;
  isActive: boolean;
  profilePicture?: string;
  followers: number;
  following: number;

  constructor(model: IUser, modelInfo: AuthResponse.UserInfo) {
    this._id = model._id.toString();
    this.username = model.username;
    this.email = model.email;
    this.name = model.name;
    this.surname = model.surname;
    this.isActive = model.isActive;
    this.profilePicture = model.profilePicture;
    this.followers = modelInfo.followers;
    this.following = modelInfo.following;
  }
}

export { UserDTO };
