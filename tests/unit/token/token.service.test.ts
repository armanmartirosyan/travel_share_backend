import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { APIError } from "../../../src/errors/api.error";
import { Tokens } from "../../../src/models/token.model";
import { TokenService } from "../../../src/services/token.service";
import { TestSetuper } from "../tests.setuper";
import type { TokenPair } from "../../../src/types";
import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";

jest.mock("../../../src/common/logger");

const testSetuper = new TestSetuper();

describe("TokenService", (): void => {
  beforeEach((): void => {
    testSetuper.clearMocks();
    testSetuper.setupEnv();
    testSetuper.setupJwt();
    testSetuper.setupTokenModel();
  });

  describe("generateTokens", (): void => {
    const basePayload = {
      iss: "travel_share_backend",
      aud: "client",
      iat: Date.now() / 1000,
      sub: "id",
    };

    it("return a pair of tokens successfully", (): void => {
      const tokenService = new TokenService();

      const res: TokenPair = tokenService.generateTokens(basePayload);

      expect(res).toHaveProperty("accessToken");
      expect(res).toHaveProperty("refreshToken");
      expect(jwt.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe("saveToken", (): void => {
    const baseUserId: Types.ObjectId = new mongoose.Types.ObjectId();
    const baseRefreshToken: string = "refreshToken";

    it("should call findOneAndUpdate", async (): Promise<void> => {
      const tokenService = new TokenService();

      await tokenService.saveToken(baseUserId, baseRefreshToken);

      expect(Tokens.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe("removeToken", (): void => {
    const refreshToken: string = "refreshToken";

    it("should call findOneAndDelete", async (): Promise<void> => {
      const tokenService = new TokenService();

      await tokenService.removeToken(refreshToken);

      expect(Tokens.findOneAndDelete).toHaveBeenCalledWith({ refreshToken });
    });
  });

  describe("verifyToken", (): void => {
    const token: string = "token";

    it("should call jwt verify and return JwtPayload", (): void => {
      const tokenService = new TokenService();

      const user: JwtPayload = tokenService.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalled();
      expect(user).toHaveProperty("sub");
      expect(user).toHaveProperty("iat");
      expect(user).toHaveProperty("iss");
      expect(user).toHaveProperty("aud");
    });

    it("should call jwt verify and throw Unauthorized error", (): void => {
      try {
        const tokenService = new TokenService();

        tokenService.verifyToken("string");

        fail("should throw Unauthorized error");
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(APIError);
        expect(error).toMatchObject(APIError.UnauthorizedError());
      }
    });
  });
});
