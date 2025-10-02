import { APIError } from "../errors/api.error.js";
import type { RequestHandler, Request, Response, NextFunction } from "express";

class Validator {
  public static commonBodyValidations(fields: string[]): RequestHandler {
    function handler(req: Request, res: Response, next: NextFunction): void {
      const missingFields: string[] = [];

      for (const field of fields) {
        if (req.body[field] === undefined || req.body[field] === null) missingFields.push(field);
      }

      if (missingFields.length > 0) throw APIError.BadRequest("M400", missingFields);
      next();
    }
    return handler;
  }
}

export { Validator };
