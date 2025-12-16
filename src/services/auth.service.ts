import crypto from "node:crypto";
import { setTimeout } from "node:timers/promises";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { MailService } from "./mail.service.js";
import { TokenService } from "./token.service.js";
import { Env } from "../config/env.config.js";
import { RedisService } from "../config/redis.config.js";
import { APIError } from "../errors/api.error.js";
import { User, ActivationToken, Follow } from "../models/index.model.js";
import type { IUser, IActivationToken, ITokens } from "../models/index.model.js";
import type { AuthResponse, AuthRequestBody, TokenPair, ValidatedEnv } from "../types/index.js";
import type { JwtPayload } from "jsonwebtoken";

class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS: number = 5;
  private readonly BLOCK_TIME: number = 10 * 60;

  private readonly _tokenService: TokenService;
  private readonly _mailService: MailService;
  private readonly _redis: RedisService;
  private readonly _env: ValidatedEnv;

  constructor() {
    this._env = Env.instance.env;
    this._tokenService = new TokenService();
    this._mailService = new MailService();
    this._redis = RedisService.instance;
  }

  public async userRegistration(
    body: AuthRequestBody.Registration,
  ): Promise<AuthResponse.UserAndToken> {
    const { username, email, name, surname, password, passwordConfirm } = body;
    const isEmailExist: IUser | null = await User.findOne({ email });
    if (isEmailExist) throw APIError.BadRequest("B400", "Email is already taken");

    const isUsernameExist: IUser | null = await User.findOne({ username });
    if (isUsernameExist) throw APIError.BadRequest("B400", "Username is already taken");

    if (password != passwordConfirm) throw APIError.BadRequest("V400", "Passwrods do no match");

    const hashedPassword: string = await bcrypt.hash(password, 10);
    const user: IUser = new User({ email, username, name, surname, password: hashedPassword });
    const activationToken: IActivationToken = new ActivationToken({
      activationToken: uuidv4(),
      userId: user.id,
    });
    const tokenPair: TokenPair = this.generateTokens(user._id.toString());

    await this._tokenService.saveToken(user._id, tokenPair.refreshToken);
    await user.save();
    await activationToken.save();
    await this._mailService.sendActivationMail(
      email,
      `${this._env.API_URL}/api/user/activate/${activationToken.activationToken}`,
    );
    return {
      user,
      userInfo: {
        followers: 0,
        following: 0,
      },
      tokenPair,
    };
  }

  public async userLogin(
    body: AuthRequestBody.Login,
    ip: string | undefined,
  ): Promise<AuthResponse.UserAndToken> {
    const identifier: string = body.login;
    const redisKey: string = `login:attempts:${identifier}:${ip}`;

    const attemptsStr: string | null = await this._redis.get(redisKey);
    const attempts: number = attemptsStr ? Number(attemptsStr) : 0;

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      await setTimeout(attempts * 1000);
      throw APIError.TooManyRequests("B429", "Too many failed login attempts. Try again later.");
    }

    const isEmail: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const user: IUser | null = isEmail
      ? await User.findOne({ email: identifier })
      : await User.findOne({ username: identifier });

    if (!user) {
      await this._redis.incrEx(redisKey, this.BLOCK_TIME);
      throw APIError.BadRequest("B400", "Invalid credentials");
    }

    const passwordMatch: boolean = await bcrypt.compare(body.password, user.password);

    if (!passwordMatch) {
      await this._redis.incrEx(redisKey, this.BLOCK_TIME);
      throw APIError.BadRequest("B400", "Invalid credentials");
    }

    const tokenPair: TokenPair = this.generateTokens(user._id.toString());

    await this._tokenService.saveToken(user._id, tokenPair.refreshToken);
    await this._redis.del(redisKey);
    const followers: number = await Follow.countDocuments({ following: user._id });
    const following: number = await Follow.countDocuments({ follower: user._id });

    return {
      user,
      userInfo: {
        followers,
        following,
      },
      tokenPair,
    };
  }

  public async userLogout(refreshToken: string): Promise<void> {
    await this._tokenService.removeToken(refreshToken);
    return;
  }

  public async userActivate(link: string): Promise<void> {
    const userToken: IActivationToken | null = await ActivationToken.findOne({
      activationToken: link,
    });
    if (!userToken) throw APIError.NoFound("N404", "Invalid activation link");

    const user: IUser | null = await User.findById(userToken.userId);
    if (!user) throw APIError.InternalServerError("Contact support for assistance");
    user.isActive = true;
    await user.save();
    return;
  }

  public async userRefresh(refreshToken: string | undefined): Promise<AuthResponse.UserAndToken> {
    if (!refreshToken) throw APIError.UnauthorizedError();
    const payload: JwtPayload = this._tokenService.verifyToken(refreshToken);
    const isTokenInDb: ITokens | null = await this._tokenService.findTokenByUserId(payload.sub);

    if (!isTokenInDb || refreshToken !== isTokenInDb.refreshToken)
      throw APIError.UnauthorizedError();

    const user: IUser | null = await User.findById(payload.sub);
    if (!user) throw APIError.UnauthorizedError();

    const tokenPair: TokenPair = this.generateTokens(user._id.toString());
    await this._tokenService.saveToken(user._id, tokenPair.refreshToken);
    const followers: number = await Follow.countDocuments({ following: user._id });
    const following: number = await Follow.countDocuments({ follower: user._id });

    return {
      user,
      userInfo: {
        followers,
        following,
      },
      tokenPair,
    };
  }

  public async forgotPassword(email: string): Promise<AuthResponse.Message> {
    const commonResponse: AuthResponse.Message = {
      message: "If an account with that email exists, a password reset link has been sent.",
    };

    const isEmail: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmail) throw APIError.BadRequest("V400", "Invalid Email Address");

    const checkSendMail: string | null = await this._redis.get(`reset:mail:${email}`);
    if (checkSendMail) return commonResponse;

    const doesEmailExist: IUser | null = await User.findOne({ email });
    if (!doesEmailExist) return commonResponse;

    const rawToken: string = uuidv4();
    const hashedToken: string = this.sha256Hash(rawToken);

    await this._redis.setEx(`reset:token:${hashedToken}`, doesEmailExist._id.toString(), 900);
    await this._redis.setEx(`reset:mail:${email}`, email, 900);
    await this._mailService.sendForgotPasswordMail(
      email,
      `${this._env.CLIENT_URL}/api/user/reset-password/${rawToken}`,
    );

    return commonResponse;
  }

  public async resetPassword(
    token: string,
    password: string,
    passwordConfirm: string,
  ): Promise<AuthResponse.Message> {
    const candidateId: string | null = await this._redis.get(`reset:token:${token}`);
    if (!candidateId) throw APIError.NoFound("N404", "Invalid or expired reset token.");

    if (password !== passwordConfirm) throw APIError.BadRequest("V400", "Passwrods do no match.");

    const hashedPassword: string = await bcrypt.hash(password, 10);
    const user: IUser | null = await User.findById(candidateId);
    if (!user) throw APIError.NoFound("N404", "User not found.");

    if (hashedPassword === user.password)
      throw APIError.BadRequest("B400", "The password cannot be the same as the old one.");

    user.password = hashedPassword;
    await user.save();
    await this._redis.del(`reset:token:${token}`);
    return {
      message: "Password has been reset successfully.",
    };
  }

  // public async getFollowers(

  // ): Promise<IUser[]> {

  // }

  private generateTokens(userID: string): TokenPair {
    const tokenPair = this._tokenService.generateTokens({
      iss: "travel_share_backend",
      aud: "client",
      iat: Math.floor(Date.now() / 1000),
      sub: userID,
    });
    return tokenPair;
  }

  private sha256Hash(string: string): string {
    return crypto.createHash("sha256").update(string).digest("hex");
  }
}

export { AuthService };
