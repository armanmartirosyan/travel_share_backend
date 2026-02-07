import type { TokenPair } from "./token.js";
import type { UserDTO } from "../../dto/user.dto.js";
import type { IUser } from "../../models/user.model.js";

export namespace AuthRequestBody {
  type Registration = {
    email: string;
    username: string;
    name?: string;
    surname?: string;
    password: string;
    passwordConfirm: string;
  };

  type Login = { login: string; password: string };

  type ForgotPassword = { email: string };

  type ResetPassword = { password: string; passwordConfirm: string };

  type UpdateUser = {
    username?: string;
    email?: string;
    name?: string;
    surname?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
}

export namespace AuthParams {
  type Activate = { link: string };

  type ResetPassword = { token: string };

  type UserID = { id: string };
}

export namespace AuthResponse {
  type Session = {
    user: UserDTO;
    accessToken: string;
  };

  type UserInfo = {
    followers: number;
    following: number;
  };

  type UserAndToken = User & {
    tokenPair: TokenPair;
  };

  type User = {
    user: IUser;
    userInfo: UserInfo;
  };

  type Message = {
    message: string;
  };

  type UploadProfilePicture = {
    filename: string;
  };
}
