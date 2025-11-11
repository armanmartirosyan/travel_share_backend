import bcrypt from "bcryptjs";
import {
  testSetuper,
  AUTH_REG_EXCEPTION_CASES,
  AUTH_LOGIN_EXCEPTION_CASES,
  AUTH_USER_ACTIVATE_EXCEPTION_CASES,
} from "./auth.service.cases";
import { APIError } from "../../../src/errors/api.error";
import { User } from "../../../src/models/user.model";
import { AuthService } from "../../../src/services/auth.service";
import { MailService } from "../../../src/services/mail.service";
import { TokenService } from "../../../src/services/token.service";
import type { AuthServiceResponse, RequestBody } from "../../../src/types";

jest.mock("node:timers/promises");
jest.mock("../../../src/common/logger");
jest.mock("uuid", () => ({ v4: jest.fn(() => "mock-uuid") }));

describe("AuthService", (): void => {
  beforeEach((): void => {
    testSetuper.clearMocks();
    testSetuper.setupEnv();
    testSetuper.setupBcrypt();
    testSetuper.setupNodeMailer();

    testSetuper.setupRedisService();
    testSetuper.setupTokenService();
    testSetuper.setupMailService();

    testSetuper.setupActivationTokenModel();
    testSetuper.setupUserModel();
  });

  describe("userRegistration", (): void => {
    const bodyBase: RequestBody.Registration = {
      username: "username",
      email: "email@example.com",
      name: "name",
      surname: "surname",
      password: "password",
      passwordConfirm: "password",
    };

    it("registers a user successfully", async (): Promise<void> => {
      const authService = new AuthService();

      const res: AuthServiceResponse = await authService.userRegistration(bodyBase);

      expect(res).toHaveProperty("user");
      expect(res).toHaveProperty("tokenPair");
      expect(bcrypt.hash).toHaveBeenCalledWith("password", 10);

      expect(TokenService.prototype.generateTokens).toHaveBeenCalled();
      expect(TokenService.prototype.saveToken).toHaveBeenCalled();
      expect(MailService.prototype.sendActivationMail).toHaveBeenCalledWith(
        "email@example.com",
        expect.stringContaining("/api/user/activate/mock-uuid"),
      );
    });

    test.each(AUTH_REG_EXCEPTION_CASES)("$name", async ({ body, instance, errors }) => {
      try {
        const authService = new AuthService();
        await authService.userRegistration(body);
        fail("Should throw an error");
      } catch (e: any) {
        expect(e).toBeInstanceOf(instance);
        expect(e.errors).toBe(errors);
      }
    });
  });

  describe("userLogin", (): void => {
    const baseIp: string = "127.0.0.1";
    const bodyBase: RequestBody.Login = {
      email: "taken@example.com",
      password: "password",
    };

    it("user login successfully with email", async (): Promise<void> => {
      const authService = new AuthService();

      const res: AuthServiceResponse = await authService.userLogin(bodyBase, baseIp);

      expect(res).toHaveProperty("user");
      expect(res).toHaveProperty("tokenPair");
      expect(bcrypt.compare).toHaveBeenCalled();

      expect(TokenService.prototype.generateTokens).toHaveBeenCalled();
      expect(TokenService.prototype.saveToken).toHaveBeenCalled();
    });

    it("user login successfully with username", async (): Promise<void> => {
      const authService = new AuthService();

      const res: AuthServiceResponse = await authService.userLogin(
        {
          username: "takenusername",
          password: "password",
        },
        baseIp,
      );

      expect(res).toHaveProperty("user");
      expect(res).toHaveProperty("tokenPair");
      expect(bcrypt.compare).toHaveBeenCalled();

      expect(TokenService.prototype.generateTokens).toHaveBeenCalled();
      expect(TokenService.prototype.saveToken).toHaveBeenCalled();
    });

    test.each(AUTH_LOGIN_EXCEPTION_CASES)("$name", async ({ body, setup, instance, errors }) => {
      try {
        const authService = new AuthService();
        if (setup !== null) setup();
        await authService.userLogin(body, baseIp);
        fail("Should throw an error");
      } catch (e: any) {
        expect(e).toBeInstanceOf(instance);
        expect(e.errors).toBe(errors);
      }
    });
  });

  describe("userLogout", (): void => {
    const refreshToken: string = "refreshToken";

    it("user logout delete refresh token", async (): Promise<void> => {
      const authService = new AuthService();

      await authService.userLogout(refreshToken);

      expect(TokenService.prototype.removeToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe("userActivate", (): void => {
    it("should activate user", async (): Promise<void> => {
      const authService = new AuthService();

      await authService.userActivate("link");

      expect(User.findById).toHaveBeenCalled();
      expect(User.prototype.save).toHaveBeenCalled();
    });

    it("invalid link should throw NoFound", async (): Promise<void> => {
      try {
        const authService = new AuthService();

        await authService.userActivate("invalid_link");
        fail("should throw NoFound error");
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(APIError);
      }
    });

    test.each(AUTH_USER_ACTIVATE_EXCEPTION_CASES)("$name", async ({ body, instance, errors }) => {
      try {
        const authService = new AuthService();
        await authService.userActivate(body.link);
        fail("Should throw an error");
      } catch (e: any) {
        expect(e).toBeInstanceOf(instance);
        expect(e.errors).toBe(errors);
      }
    });
  });
});
