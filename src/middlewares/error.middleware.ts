import mongoose from "mongoose";
import { Logger } from "../common/logger.js";
import { ResponseGenerator } from "../common/response.generator.js";
import { APIError } from "../errors/api.error.js";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";

class ErrorMiddleware {
  private static _logger: Logger = new Logger("ErrorMiddleware");

  public static ErrorHandler(): ErrorRequestHandler {
    function handler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
      if (error instanceof APIError) {
        ErrorMiddleware._logger.debug(error);
        res
          .status(error.status)
          .json(ResponseGenerator.error(error.code, { reason: error.errors }));
        return;
      }
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json(ResponseGenerator.error("V400", { reason: error.errors }));
        return;
      }
      if (error instanceof SyntaxError) {
        ErrorMiddleware._logger.warn(error);
        res.status(400).json(ResponseGenerator.error("B400", { reason: error.message }));
        return;
      }
      res.status(500).json(ResponseGenerator.error<null>("INTERNAL_SERVER_ERROR", null));
      ErrorMiddleware._logger.error("Unexpected error", error);
      return;
    }
    return handler;
  }
}

export { ErrorMiddleware };
