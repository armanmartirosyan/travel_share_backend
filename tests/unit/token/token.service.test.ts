import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Tokens } from "../../../src/models/token.model";
import { TokenService } from "../../../src/services/token.service";
import { TestSetuper } from "../tests.setuper";
import type { TokenPair } from "../../../src/types";
import type { Types } from "mongoose";

jest.mock("../../../src/common/logger");

describe("TokenService", (): void => {
  beforeEach((): void => {
    TestSetuper.clearMocks();
    TestSetuper.setupEnv();
    TestSetuper.setupJwt();
    TestSetuper.setupTokenModel();
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
});
