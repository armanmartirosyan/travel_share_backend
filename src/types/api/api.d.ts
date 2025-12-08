import type { JwtPayload } from "jsonwebtoken";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  code: string;
  data: T;
};

export declare module "express" {
  export interface Request {
    user?: JwtPayload;
  }
}
