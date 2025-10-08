import type { IUser } from "../models/user.model.js";

class UserDTO {
  username: string;
  email: string;
  name?: string;
  surname?: string;
  isActive: boolean;
  profilePicture?: string;
  followers: number;
  following: number;

  constructor(model: IUser) {
    this.username = model.username;
    this.email = model.email;
    this.name = model.name;
    this.surname = model.surname;
    this.isActive = model.isActive;
    this.profilePicture = model.profilePicture;
    this.followers = model.followers.length;
    this.following = model.following.length;
  }
}

export { UserDTO };
