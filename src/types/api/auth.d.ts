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

  type Activate = { link: string };
}

export type AuthResponse = {
  user: UserDTO;
  accessToken: string;
};

export type AuthServiceResponse = {
  user: IUser;
  tokenPair: TokenPair;
};
