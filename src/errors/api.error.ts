import type { ResponseMapType } from "../types/index.js";

class APIError extends Error {
  status: number;
  success: boolean;
  code: keyof ResponseMapType;
  errors: any;

  constructor(status: number, code: keyof ResponseMapType, message: string, errors?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.success = false;
    Object.setPrototypeOf(this, APIError.prototype);
  }

  static UnauthorizedError(): APIError {
    return new APIError(401, "U401", "User is not authorized.");
  }

  static BadRequest(code: keyof ResponseMapType, errors: any): APIError {
    return new APIError(400, code, "Bad Reqeust", errors);
  }

  static NoFound(code: keyof ResponseMapType, errors: any): APIError {
    return new APIError(404, code, "Not Found", errors);
  }

  static Forbidden(code: keyof ResponseMapType, errors: any): APIError {
    return new APIError(403, code, "Forbidden", errors);
  }

  static TooManyRequests(code: keyof ResponseMapType, errors: any): APIError {
    return new APIError(429, code, "Too Many Requests", errors);
  }

  static InternalServerError(errors?: any): APIError {
    return new APIError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error", errors);
  }
}

export { APIError };
