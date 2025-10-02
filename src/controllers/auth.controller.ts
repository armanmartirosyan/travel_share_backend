import { ResponseGenerator } from "../common/response.generator.js";
import { AuthService } from "../services/auth.service.js";
import type { AuthResponse } from "../types/api/auth.js";
import type { NextFunction, Request, Response } from "express";

class AuthController {
  private readonly _authService: AuthService;

  constructor() {
    this._authService = new AuthService();
  }

  async userRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, password, passwordConfirm } = req.body;
      const result: AuthResponse = await this._authService.userRegistration(
        email,
        username,
        password,
        passwordConfirm,
      );
      res.status(200).json(ResponseGenerator.success("OK", result));
      return;
    } catch (error: unknown) {
      next(error);
    }
  }
}

export { AuthController };
