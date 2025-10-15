import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Env } from "../../src/config/env.config";
import { ActivationToken } from "../../src/models/activation.model";
import { Tokens } from "../../src/models/token.model";
import { User } from "../../src/models/user.model";
import { MailService } from "../../src/services/mail.service";
import { TokenService } from "../../src/services/token.service";
import type { ValidatedEnv } from "../../src/types";

class TestSetuper {
  public static clearMocks(): void {
    jest.resetModules();
    jest.clearAllMocks();
  }

  public static setupEnv(): void {
    jest.spyOn(Env.instance, "env", "get").mockReturnValue(TestSetuper.mockEnv());
  }

  public static setupBcrypt(): void {
    bcrypt.hash = jest.fn().mockResolvedValue("hashed-password");
  }

  public static setupJwt(): void {
    jwt.sign = jest.fn().mockResolvedValue("Token");
    jwt.decode = jest.fn().mockResolvedValue({
      iss: "travel_share_backend",
      aud: "client",
      iat: Date.now() / 1000,
      sub: "id",
    });
  }

  public static setupActivationTokenModel(): void {
    jest.spyOn(ActivationToken.prototype, "save").mockResolvedValue(undefined);
  }

  public static setupNodeMailer(): void {
    // nodeMailer.createTKkestAccount
  }

  public static setupTokenService(): void {
    jest
      .spyOn(TokenService.prototype, "generateTokens")
      .mockReturnValue({ accessToken: "a", refreshToken: "r" });
    jest.spyOn(TokenService.prototype, "saveToken").mockResolvedValue(undefined);
  }

  public static setupMailService(): void {
    jest.spyOn(MailService.prototype, "sendActivationMail").mockResolvedValue(undefined);
  }

  public static setupUserModel(): void {
    // model saves
    jest.spyOn(User.prototype, "save").mockResolvedValue(undefined);

    // model find
    User.findOne = jest.fn().mockImplementation(({ email, username }) => {
      if (email === "taken@example.com" || username === "takenusername")
        return Promise.resolve({ _id: "u1", email });
      return Promise.resolve(null);
    });
  }

  public static setupTokenModel(): void {
    // model saves
    jest.spyOn(Tokens.prototype, "save").mockResolvedValue(undefined);

    // model find
    jest.spyOn(Tokens, "findOne").mockResolvedValue({
      userID: new mongoose.Types.ObjectId(),
      refreshToken: "refreshToken",
      expiresAt: new Date(),
    });

    jest.spyOn(Tokens, "findOneAndUpdate").mockResolvedValue({
      userID: new mongoose.Types.ObjectId(),
      refreshToken: "refreshToken",
      expiresAt: new Date(),
    });
  }

  public static mockEnv(): ValidatedEnv {
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
