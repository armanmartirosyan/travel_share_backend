import { Logger } from "../common/logger.js";
import { ResponseGenerator } from "../common/response.generator.js";
import { Env } from "../config/env.config.js";
import { UserDTO } from "../dto/user.dto.js";
import { AuthService } from "../services/auth.service.js";
import type {
  ApiResponse,
  AuthResponse,
  AuthRequestBody,
  AuthParams,
  ValidatedEnv,
} from "../types/index.js";
import type { NextFunction, Request, Response } from "express";

class AuthController {
  private readonly _authService: AuthService;
  private readonly _env: ValidatedEnv;
  private readonly _logger: Logger;

  constructor() {
    this._env = Env.instance.env;
    this._authService = new AuthService();
    this._logger = new Logger("UserController");
  }

  public async userRegistration(
    req: Request<{}, {}, AuthRequestBody.Registration>,
    res: Response<ApiResponse<AuthResponse.Session>>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result: AuthResponse.UserAndToken = await this._authService.userRegistration(req.body);
      this.setRefreshCookie(res, result.tokenPair.refreshToken);
      const response: AuthResponse.Session = {
        user: new UserDTO(result.user, result.userInfo),
        accessToken: result.tokenPair.accessToken,
      };
      res.status(200).json(ResponseGenerator.success<AuthResponse.Session>("OK", response));
      return;
    } catch (error: unknown) {
      next(error);
    }
  }

  public async userLogin(
    req: Request<{}, {}, AuthRequestBody.Login>,
    res: Response<ApiResponse<AuthResponse.Session>>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result: AuthResponse.UserAndToken = await this._authService.userLogin(req.body, req.ip);
      this.setRefreshCookie(res, result.tokenPair.refreshToken);
      const response: AuthResponse.Session = {
        user: new UserDTO(result.user, result.userInfo),
        accessToken: result.tokenPair.accessToken,
      };
      res.status(200).json(ResponseGenerator.success<AuthResponse.Session>("OK", response));
      return;
    } catch (error: unknown) {
      next(error);
    }
  }

  public async userLogout(
    req: Request,
    res: Response<ApiResponse<null>>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken }: Record<string, string> = req.cookies;
      await this._authService.userLogout(refreshToken);
      res.clearCookie("refreshToken");
      res.sendStatus(204);
      return;
    } catch (error: unknown) {
      next(error);
    }
  }

  public async userActivate(
    req: Request<AuthParams.Activate>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { link } = req.params;
      await this._authService.userActivate(link);
      res.redirect(this._env.CLIENT_URL);
      return;
    } catch (error: unknown) {
      next(error);
    }
  }

  public async userRefresh(
    req: Request,
    res: Response<ApiResponse<AuthResponse.Session>>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      const result: AuthResponse.UserAndToken = await this._authService.userRefresh(refreshToken);
      const response: AuthResponse.Session = {
        user: new UserDTO(result.user, result.userInfo),
        accessToken: result.tokenPair.accessToken,
      };
      this.setRefreshCookie(res, result.tokenPair.refreshToken);
      res.status(200).json(ResponseGenerator.success<AuthResponse.Session>("OK", response));
    } catch (error: unknown) {
      next(error);
    }
  }

  public async forgotPassword(
    req: Request<{}, {}, AuthRequestBody.ForgotPassword>,
    res: Response<ApiResponse<AuthResponse.Message>>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;
      const result: AuthResponse.Message = await this._authService.forgotPassword(email);
      res.status(200).json(ResponseGenerator.success<AuthResponse.Message>("OK", result));
    } catch (error: unknown) {
      next(error);
    }
  }

  public async resetPassword(
    req: Request<AuthParams.ResetPassword, {}, AuthRequestBody.ResetPassword>,
    res: Response<ApiResponse<AuthResponse.Message>>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token } = req.params;
      const { password, passwordConfirm } = req.body;
      const result: AuthResponse.Message = await this._authService.resetPassword(
        token,
        password,
        passwordConfirm,
      );
      res.status(200).json(ResponseGenerator.success<AuthResponse.Message>("OK", result));
    } catch (error: unknown) {
      next(error);
    }
  }

  // public async getFollowers(
  //   req: Request,
  //   res: Response<ApiResponse<any>>,
  //   next: NextFunction,
  // ): Promise<void> {
  //   try {
  //     const result = await this._authService.resetPassword();
  //     res.status(200).json(ResponseGenerator.success("OK", result));
  //   } catch (error: unknown) {
  //     next(error);
  //   }
  // }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: !this._env.ISDEV,
    });
  }
}

export { AuthController };
