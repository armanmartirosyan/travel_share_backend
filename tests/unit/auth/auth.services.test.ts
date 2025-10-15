import bcrypt from "bcryptjs";
import { AUTH_REG_EXCEPTION_CASES } from "./auth.service.cases";
import { AuthService } from "../../../src/services/auth.service";
import { MailService } from "../../../src/services/mail.service";
import { TokenService } from "../../../src/services/token.service";
import { TestSetuper } from "../tests.setuper";
import type { AuthServiceResponse, RequestBody } from "../../../src/types";

jest.mock("../../../src/common/logger");
jest.mock("uuid", () => ({ v4: jest.fn(() => "mock-uuid") }));

describe("AuthService", (): void => {
  beforeEach((): void => {
    TestSetuper.clearMocks();
    TestSetuper.setupEnv();
    TestSetuper.setupBcrypt();

    // TokenService & MailService
    TestSetuper.setupTokenService();
    TestSetuper.setupMailService();

    TestSetuper.setupActivationTokenModel();
    TestSetuper.setupUserModel();
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
      } catch (e: any) {
        expect(e).toBeInstanceOf(instance);
        expect(e.errors).toBe(errors);
      }
    });
  });
});
