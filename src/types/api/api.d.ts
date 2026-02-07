import type { JwtPayload } from "jsonwebtoken";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  code: string;
  data: T;
};

export type Pagination = {
  page: string;
  limit: string;
  sort?: string;
};

export declare module "express" {
  export interface Request {
    payload?: JwtPayload;
  }
}
