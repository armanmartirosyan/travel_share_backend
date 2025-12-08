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
}

export namespace AuthParams {
  type Activate = { link: string };

  type ResetPassword = { token: string };
}

export namespace AuthResponse {
  type Session = {
    user: UserDTO;
    accessToken: string;
  };

  type UserAndToken = {
    user: IUser;
    tokenPair: TokenPair;
  };

  type ForgotPassword = {
    message: string;
  };
}
