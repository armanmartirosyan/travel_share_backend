import type { TokenPair } from "./token.js";
import type { UserDTO } from "../../dto/user.dto.js";
import type { IUser } from "../../models/user.model.js";

export namespace RequestBody {
  type Registration = {
    email: string;
    username: string;
    name?: string;
    surname?: string;
    password: string;
    passwordConfirm: string;
  };

  type Login =
    | { email: string; password: string; username?: never }
    | { username: string; password: string; email?: never };

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
