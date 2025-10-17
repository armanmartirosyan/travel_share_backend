import jwt from "jsonwebtoken";
import { Env } from "../config/env.config.js";
import { Tokens } from "../models/token.model.js";
import type { TokenPair } from "../types/index.js";
// import type { ITokens } from "../models/index.model.js";
import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";

class TokenService {
  private readonly _accessTokenSecret: string;
  private readonly _refreshTokenSecret: string;

  constructor() {
    this._accessTokenSecret = Env.instance.env.ACCESS_TOKEN_SECRET;
    this._refreshTokenSecret = Env.instance.env.REFRESH_TOKEN_SECRET;
  }

  public generateTokens(payload: JwtPayload): TokenPair {
    const accessToken: string = jwt.sign(payload, this._accessTokenSecret, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    const refreshToken: string = jwt.sign(payload, this._refreshTokenSecret, {
      algorithm: "HS256",
      expiresIn: "7d",
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  public async saveToken(userID: Types.ObjectId, refreshToken: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Tokens.findOneAndUpdate(
      { userID },
      { refreshToken, expiresAt },
      { upsert: true, new: true },
    );
    return;
  }

  public async removeToken(token: string): Promise<void> {
    await Tokens.findOneAndDelete({ refreshToken: token });
    return;
  }
}

export { TokenService };
