import bcrypt from "bcryptjs";
import {
  testSetuper,
  AUTH_REG_EXCEPTION_CASES,
  AUTH_LOGIN_EXCEPTION_CASES,
  AUTH_USER_ACTIVATE_EXCEPTION_CASES,
  AUTH_USER_REFRESH_EXCEPTION_CASES,
  AUTH_FORGOT_PASSWORD_EXCEPTION_CASES,
  AUTH_RESET_PASSWORD_EXCEPTION_CASES,
} from "./auth.service.cases";
import { User } from "../../../src/models/user.model";
import { AuthService } from "../../../src/services/auth.service";
import { MailService } from "../../../src/services/mail.service";
import { TokenService } from "../../../src/services/token.service";
import type { AuthResponse, AuthRequestBody } from "../../../src/types";

jest.mock("node:timers/promises");
jest.mock("../../../src/common/logger");
jest.mock("uuid", () => ({ v4: jest.fn(() => "mock-uuid") }));

describe("AuthService", (): void => {
  beforeEach((): void => {
    testSetuper.clearMocks();
    testSetuper.setupEnv();
    testSetuper.setupBcrypt();
    testSetuper.setupNodeMailer();
    testSetuper.setupJwt();

    testSetuper.setupRedisService();
    testSetuper.setupTokenService();
    testSetuper.setupMailService();

    testSetuper.setupActivationTokenModel();
    testSetuper.setupUserModel();
    testSetuper.setupFollowModel();
  });

  describe("userRegistration", (): void => {
    const bodyBase: AuthRequestBody.Registration = {
      username: "username",
      email: "email@example.com",
      name: "name",
      surname: "surname",
      password: "password",
      passwordConfirm: "password",
    };

    it("registers a user successfully", async (): Promise<void> => {
      const authService = new AuthService();

      const res: AuthResponse.UserAndToken = await authService.userRegistration(bodyBase);

      expect(res).toHaveProperty("user");
      expect(res).toHaveProperty("userInfo");
      expect(res).toHaveProperty("tokenPair");
      expect(bcrypt.hash).toHaveBeenCalledWith("password", 10);

      expect(TokenService.prototype.generateTokens).toHaveBeenCalled();
      expect(TokenService.prototype.saveToken).toHaveBeenCalled();
      expect(MailService.prototype.sendActivationMail).toHaveBeenCalledWith(
        "email@example.com",
        expect.stringContaining("/api/user/activate/mock-uuid"),
      );
    });

    test.each(AUTH_REG_EXCEPTION_CASES)("$name", async ({ body, message, instance, errors }) => {
      try {
        const authService = new AuthService();
        await authService.userRegistration(body);
        fail("Should throw an error");
      } catch (e: any) {
        expect(e).toBeInstanceOf(instance);
        expect(e.message).toBe(message);
        expect(e.errors).toBe(errors);
      }
    });
  });

  describe("userLogin", (): void => {
    const baseIp: string = "127.0.0.1";
    const bodyBase: AuthRequestBody.Login = {
      login: "taken@example.com",
      password: "password",
    };

    it("user login successfully with email", async (): Promise<void> => {
      const authService = new AuthService();

      const res: AuthResponse.UserAndToken = await authService.userLogin(bodyBase, baseIp);

      expect(res).toHaveProperty("user");
      expect(res).toHaveProperty("userInfo");
      expect(res).toHaveProperty("tokenPair");
      expect(bcrypt.compare).toHaveBeenCalled();

      expect(TokenService.prototype.generateTokens).toHaveBeenCalled();
      expect(TokenService.prototype.saveToken).toHaveBeenCalled();
    });

    it("user login successfully with username", async (): Promise<void> => {
      const authService = new AuthService();

      const res: AuthResponse.UserAndToken = await authService.userLogin(
        {
          login: "takenusername",
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

    test.each(AUTH_LOGIN_EXCEPTION_CASES)(
      "$name",
      async ({ body, message, setup, instance, errors }) => {
        try {
          const authService = new AuthService();
          if (setup !== null) setup();
          await authService.userLogin(body, baseIp);
          fail("Should throw an error");
        } catch (e: any) {
          expect(e).toBeInstanceOf(instance);
          expect(e.message).toBe(message);
          expect(e.errors).toBe(errors);
        }
      },
    );
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

    test.each(AUTH_USER_ACTIVATE_EXCEPTION_CASES)(
      "$name",
      async ({ params, message, instance, errors }) => {
        try {
          const authService = new AuthService();
          await authService.userActivate(params.link);
          fail("Should throw an error");
        } catch (e: any) {
          expect(e).toBeInstanceOf(instance);
          expect(e.message).toBe(message);
          expect(e.errors).toBe(errors);
        }
      },
    );
  });

  describe("userRefresh", (): void => {
    const refreshToken: string = "refreshToken";

    it("successfully refresh credentials", async (): Promise<void> => {
      const authService = new AuthService();

      const res: AuthResponse.UserAndToken = await authService.userRefresh(refreshToken);

      expect(res).toHaveProperty("user");
      expect(res).toHaveProperty("tokenPair");

      expect(TokenService.prototype.findTokenByUserId).toHaveBeenCalled();
      expect(TokenService.prototype.generateTokens).toHaveBeenCalled();
      expect(TokenService.prototype.saveToken).toHaveBeenCalled();
      expect(TokenService.prototype.saveToken).toHaveBeenCalled();
    });

    test.each(AUTH_USER_REFRESH_EXCEPTION_CASES)(
      "$name",
      async ({ body, message, instance, errors }) => {
        try {
          const authService = new AuthService();
          await authService.userRefresh(body.refreshToken);
          fail("Should throw an error");
        } catch (e: any) {
          expect(e).toBeInstanceOf(instance);
          expect(e.message).toBe(message);
          expect(e.errors).toBe(errors);
        }
      },
    );
  });

  describe("forgotPasswrod", (): void => {
    const commonEmail: string = "taken@example.com";

    it("successfully send forgot password mail", async (): Promise<void> => {
      const authService = new AuthService();

      const res: AuthResponse.Message = await authService.forgotPassword(commonEmail);

      expect(res).toHaveProperty("message");
      expect(res.message).toBe(
        "If an account with that email exists, a password reset link has been sent.",
      );

      expect(MailService.prototype.sendForgotPasswordMail).toHaveBeenCalledWith(
        commonEmail,
        expect.stringContaining("/api/user/reset-password/mock-uuid"),
      );
    });

    it("email doesn't exist, get common response", async (): Promise<void> => {
      const authService = new AuthService();

      const res: AuthResponse.Message = await authService.forgotPassword(
        "notExistEmail@example.com",
      );

      expect(res).toHaveProperty("message");
      expect(res.message).toBe(
        "If an account with that email exists, a password reset link has been sent.",
      );
    });

    it("email already sent, get common response", async (): Promise<void> => {
      const authService = new AuthService();

      testSetuper.redisService.get.mockResolvedValueOnce("alreadySent@example.com");
      const res: AuthResponse.Message = await authService.forgotPassword("alreadySent@example.com");

      expect(res).toHaveProperty("message");
      expect(res.message).toBe(
        "If an account with that email exists, a password reset link has been sent.",
      );
    });

    test.each(AUTH_FORGOT_PASSWORD_EXCEPTION_CASES)(
      "$name",
      async ({ body, message, instance, errors }) => {
        try {
          const authService = new AuthService();
          await authService.forgotPassword(body.email);
          fail("Should throw an error");
        } catch (e: any) {
          expect(e).toBeInstanceOf(instance);
          expect(e.message).toBe(message);
          expect(e.errors).toBe(errors);
        }
      },
    );
  });

  describe("resetPassword", (): void => {
    const commonToken: string = "commonToken";
    const commonPassword: string = "commonPassword";
    const commonConfirmPassowrd: string = "commonPassword";

    it("successfully reset user password", async (): Promise<void> => {
      const authService = new AuthService();

      testSetuper.redisService.get.mockResolvedValueOnce("taken@example.com");
      const res: AuthResponse.Message = await authService.resetPassword(
        commonToken,
        commonPassword,
        commonConfirmPassowrd,
      );

      expect(res).toHaveProperty("message");
      expect(res.message).toBe("Password has been reset successfully.");
      expect(User.findById).toHaveBeenCalled();
      expect(User.prototype.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(commonPassword, 10);
    });

    test.each(AUTH_RESET_PASSWORD_EXCEPTION_CASES)(
      "$name",
      async ({ body, params, setup, message, instance, errors }) => {
        try {
          const authService = new AuthService();
          if (setup) setup();
          await authService.resetPassword(params.token, body.password, body.passwordConfirm);
          fail("Should throw an error");
        } catch (e: any) {
          expect(e).toBeInstanceOf(instance);
          expect(e.message).toBe(message);
          expect(e.errors).toBe(errors);
        }
      },
    );
  });
});
