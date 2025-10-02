import type { ApiResponse, ResponseMapType } from "../types/index.js";

class ResponseGenerator {
  private static RESPONSE_MAP: ResponseMapType = {
    OK: "Success",
    INTERNAL_SERVER_ERROR: "Internal Server Error",
    U401: "User is not authorized.",
    B400: "Bad Request",
    M400: "Missing values",
    N404: "Not Found",
    F403: "Forbidden",
  };

  static success<T>(code: keyof ResponseMapType, data: T): ApiResponse<T> {
    return {
      success: true,
      message: this.RESPONSE_MAP[code],
      code,
      data,
    };
  }

  static error<T>(code: keyof ResponseMapType, data?: T): ApiResponse<T> {
    return {
      success: false,
      message: this.RESPONSE_MAP[code],
      code,
      data,
    };
  }
}

export { ResponseGenerator };
