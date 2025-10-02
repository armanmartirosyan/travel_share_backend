import { Logger } from "../common/logger.js";
import { ResponseGenerator } from "../common/response.generator.js";
import { APIError } from "../errors/api.error.js";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";

class ErrorMiddleware {
  private static _logger: Logger = new Logger("ErrorMiddleware");

  public static ErrorHandler(): ErrorRequestHandler {
    function handler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
      if (error instanceof APIError) {
        ErrorMiddleware._logger.warn(error);
        res.status(error.status).json(ResponseGenerator.error(error.code, error.errors));
        return;
      }
      res.status(500).json(ResponseGenerator.error("INTERNAL_SERVER_ERROR"));
      ErrorMiddleware._logger.error("Unexpected error", error);
      return;
    }
    return handler;
  }
}

export { ErrorMiddleware };
