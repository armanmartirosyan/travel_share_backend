import { AuthService } from "../services/auth.service.js";
import type { Request, Response } from "express";

class AuthController {
  private readonly _authService: AuthService;

  constructor() {
    this._authService = new AuthService();
  }

  async getUser(req: Request, res: Response): Promise<void> {
    res.json(this._authService.getUser());
  }
}

export { AuthController };
