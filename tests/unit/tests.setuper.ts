import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import nodeMailer from "nodemailer";
import { Env } from "../../src/config/env.config";
import { RedisService } from "../../src/config/redis.config";
import { ActivationToken } from "../../src/models/activation.model";
import { Tokens } from "../../src/models/token.model";
import { User } from "../../src/models/user.model";
import { MailService } from "../../src/services/mail.service";
import { TokenService } from "../../src/services/token.service";
import type { ValidatedEnv } from "../../src/types";
import type { JwtPayload } from "jsonwebtoken";

class TestSetuper {
  public readonly redisService;

  constructor() {
    this.redisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue("OK"),
      setEx: jest.fn().mockResolvedValue("OK"),
      incr: jest.fn().mockResolvedValue(1),
      incrEx: jest.fn().mockResolvedValue(1),
      decr: jest.fn().mockResolvedValue(1),
      del: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      disconnect: jest.fn(),
    };
  }

  public clearMocks(): void {
    jest.resetModules();
    jest.clearAllMocks();
  }

  public setupEnv(): void {
    jest.spyOn(Env.instance, "env", "get").mockReturnValue(this.mockEnv());
  }

  public setupBcrypt(): void {
    bcrypt.hash = jest.fn().mockResolvedValue("hashed-password");
    bcrypt.compare = jest.fn().mockImplementation((password: string): boolean => {
      if (password === "wrongPassword") return false;
      return true;
    });
  }

  public setupJwt(): void {
    jwt.sign = jest.fn().mockResolvedValue("Token");
    jwt.decode = jest.fn().mockResolvedValue({
      iss: "travel_share_backend",
      aud: "client",
      iat: Date.now() / 1000,
      sub: "id",
    });
    jwt.verify = jest.fn().mockImplementation((value: string): JwtPayload | string => {
      if (value === "string") return value;
      return {
        iss: "travel_share_backend",
        aud: "client",
        iat: Date.now() / 1000,
        sub: "id",
      };
    });
  }

  public setupActivationTokenModel(): void {
    const mockActivationToken = new ActivationToken({
      activationToken: "link",
      userId: new mongoose.Types.ObjectId(),
      save: jest.fn().mockResolvedValue(undefined),
    });
    //model save
    jest.spyOn(ActivationToken.prototype, "save").mockResolvedValue(undefined);

    // model find
    ActivationToken.findOne = jest.fn().mockImplementation(({ activationToken }) => {
      if (activationToken === "link") {
        return Promise.resolve(mockActivationToken);
      } else if (activationToken === "noUserLink")
        return Promise.resolve({ ...mockActivationToken, userId: "noUserLink" });
      return Promise.resolve(null);
    });
  }

  public setupNodeMailer(): void {
    const sendMailMock: jest.Mock = jest.fn();

    nodeMailer.createTransport = jest.fn().mockReturnValue({ sendMail: sendMailMock });
  }

  public setupTokenService(): void {
    jest
      .spyOn(TokenService.prototype, "generateTokens")
      .mockReturnValue({ accessToken: "a", refreshToken: "r" });
    jest.spyOn(TokenService.prototype, "saveToken").mockResolvedValue(undefined);
    jest.spyOn(TokenService.prototype, "removeToken").mockResolvedValue(undefined);
  }

  public setupRedisService(): void {
    jest
      .spyOn(RedisService, "instance", "get")
      .mockReturnValue(this.redisService as unknown as RedisService);
  }

  public setupMailService(): void {
    jest.spyOn(MailService.prototype, "sendActivationMail").mockResolvedValue(undefined);
  }

  public setupUserModel(): void {
    const mockUser = new User({
      email: "taken@example.com",
      username: "takenusername",
      password: "hashedPassword",
    });
    // model saves
    jest.spyOn(User.prototype, "save").mockResolvedValue(undefined);

    // model find
    User.findOne = jest.fn().mockImplementation(({ email, username }) => {
      if (email === "taken@example.com" || username === "takenusername") {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    });
    // jest.spyOn(User, "findById").mockResolvedValue(mockUser);
    User.findById = jest.fn().mockImplementation((id: string) => {
      if (id === "noUserLink") return Promise.resolve(null);
      return Promise.resolve(mockUser);
    });
  }

  public setupTokenModel(): void {
    const mockTokens = new Tokens({
      userID: new mongoose.Types.ObjectId(),
      refreshToken: "refreshToken",
      expiresAt: new Date(),
    });
    // model saves
    jest.spyOn(Tokens.prototype, "save").mockResolvedValue(undefined);

    // model find
    jest.spyOn(Tokens, "findOne").mockResolvedValue(mockTokens);
    jest.spyOn(Tokens, "findOneAndUpdate").mockResolvedValue(mockTokens);
    jest.spyOn(Tokens, "findOneAndDelete").mockResolvedValue(mockTokens);
  }

  public mockEnv(): ValidatedEnv {
    return {
      PORT: 8080,
      LOG_LEVEL: "debug",
      NODE_ENV: "test",
      CLIENT_URL: "http://127.0.0.1:9995/",
      MONGO_URL: "mongo://some-url",
      REDIS_URL: "redis://some-url",
      LOG_PATH: "./logs",
      ISDEV: true,
      ACCESS_TOKEN_SECRET: "xxx",
      REFRESH_TOKEN_SECRET: "xxx",
      SMTP_HOST: "http://smtp-host",
      SMTP_USERNAME: "smtp-username",
      SMTP_PASSWORD: "smtp-password",
      SMTP_PORT: 465,
      API_URL: "http://127.0.0.1:8080/",
      MAIL_SERVICE_STATUS: "disable",
      MAIL_SERVICE: true,
    };
  }
}

export { TestSetuper };
