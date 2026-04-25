import { Types } from "mongoose";
import { Logger } from "../common/logger.js";
import { ResponseGenerator } from "../common/response.generator.js";
import { APIError } from "../errors/api.error.js";
import { FollowService } from "../services/follow.service.js";
import type { FollowParams, FollowResponse } from "../types/index.js";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

class FollowController {
  private readonly _followService: FollowService;
  private readonly _logger: Logger;

  constructor() {
    this._followService = new FollowService();
    this._logger = new Logger("FollowController");
  }

  public async createFollow(
    req: Request<FollowParams.Id>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const targetUserId: string | undefined = req.params.followingId;
      const payload: JwtPayload = req.payload!;

      await this._followService.createFollow(payload.sub, targetUserId);

      this._logger.debug("Follow Created");
      res.sendStatus(201);
    } catch (error: unknown) {
      next(error);
    }
  }

  public async deleteFollow(
    req: Request<FollowParams.Id>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { followingId } = req.params;
      const payload: JwtPayload = req.payload!;

      await this._followService.deleteFollow(followingId, payload.sub);

      this._logger.debug("Follow Deleted");
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  public async getFollowers(
    req: Request<FollowParams.UserId>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) throw APIError.BadRequest("M400", "User id is required.");
      if (!Types.ObjectId.isValid(userId)) throw APIError.BadRequest("V400", "Not valid user id.");

      const response: FollowResponse.GetFollowers = await this._followService.getFollowers(userId);
      this._logger.debug("Followers Retrieved");
      res.status(200).json(ResponseGenerator.success<FollowResponse.GetFollowers>("OK", response));
    } catch (error: unknown) {
      next(error);
    }
  }

  public async getFollowing(
    req: Request<FollowParams.UserId>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) throw APIError.BadRequest("M400", "User id is required.");
      if (!Types.ObjectId.isValid(userId)) throw APIError.BadRequest("V400", "Not valid user id.");

      const response: FollowResponse.GetFollowing = await this._followService.getFollowing(userId);
      this._logger.debug("Following Retrieved");
      res.status(200).json(ResponseGenerator.success<FollowResponse.GetFollowing>("OK", response));
    } catch (error: unknown) {
      next(error);
    }
  }
}

export { FollowController };
