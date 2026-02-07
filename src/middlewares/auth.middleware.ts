import { Logger } from "../common/logger.js";
import { Env } from "../config/env.config.js";
import { APIError } from "../errors/api.error.js";
import { TokenService } from "../services/token.service.js";
import type { ValidatedEnv } from "../types/index.js";
import type { RequestHandler, Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";

class AuthMiddleware {
  private static _logger: Logger = new Logger("AuthMiddleware");
  private static _env: ValidatedEnv = Env.instance.env;
  private static _tokenService: TokenService = new TokenService();

  public static authHandler(): RequestHandler {
    function handler(req: Request, _res: Response, next: NextFunction): void {
      const authHeader: string | undefined = req.headers.authorization;
      if (!authHeader) throw APIError.UnauthorizedError();

      const splitToken: string[] = authHeader.split(" ");
      if (splitToken[0] !== "Bearer") throw APIError.UnauthorizedError();

      const accessToken: string = splitToken[1];
      const user: JwtPayload = AuthMiddleware._tokenService.verifyToken(accessToken);

      Object.defineProperty(req, "payload", {
        value: user,
        writable: false,
        enumerable: true,
        configurable: false,
      });
      next();
    }
    return handler;
  }
}

export { AuthMiddleware };
