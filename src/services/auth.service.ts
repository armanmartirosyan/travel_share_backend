import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { MailService } from "./mail.service.js";
import { TokenService } from "./token.service.js";
import { APIError } from "../errors/api.error.js";
import { User, ActivationToken } from "../models/index.model.js";
import type { IUser, IActivationToken } from "../models/index.model.js";
import type { AuthServiceResponse, RequestBody } from "../types/index.js";

class AuthService {
  private readonly _tokenService: TokenService;
  private readonly _mailService: MailService;

  constructor() {
    this._tokenService = new TokenService();
    this._mailService = new MailService();
  }

  public async userRegistration(body: RequestBody.Registration): Promise<AuthServiceResponse> {
    const { username, email, name, surname, password, passwordConfirm } = body;
    const isEmailExist: IUser | null = await User.findOne({ email });
    if (isEmailExist) {
      throw APIError.BadRequest("B400", "Email is already taken");
    }
    const isUsernameExist: IUser | null = await User.findOne({ username });
    if (isUsernameExist) {
      throw APIError.BadRequest("B400", "Username is already taken");
    }
    if (password != passwordConfirm) {
      throw APIError.BadRequest("V400", "Passwrods do no match");
    }
    const hashedPassword: string = await bcrypt.hash(password, 10);
    const user: IUser = new User({ email, username, name, surname, password: hashedPassword });
    const activationToken: IActivationToken = new ActivationToken({
      activationToken: uuidv4(),
      userId: user.id,
    });

    await user.save();
    await activationToken.save();
    return {
      user,
      accessToken: "xxx",
      refreshToken: "xxx",
    };
  }
}

export { AuthService };
