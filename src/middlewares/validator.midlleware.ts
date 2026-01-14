import { APIError } from "../errors/api.error.js";
import type { RequestHandler, Request, Response, NextFunction } from "express";

class Validator {
  public static commonBodyFields(fields: string[]): RequestHandler {
    function handler(req: Request, _res: Response, next: NextFunction): void {
      const missingFields: string[] = [];

      Validator.checkBodyExisting(req);
      for (const field of fields) {
        if (req.body[field] === undefined || req.body[field] === null)
          missingFields.push(`Missing field ${field}`);
      }

      if (missingFields.length > 0) throw APIError.BadRequest("M400", missingFields);
      next();
    }
    return handler;
  }

  private static checkBodyExisting(req: Request): void {
    if (req.body === undefined || req.body === null)
      throw APIError.BadRequest("B400", "No request body provided");
  }
}

export { Validator };
