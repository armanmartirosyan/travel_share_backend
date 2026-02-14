import { Logger } from "../common/logger.js";
import { ResponseGenerator } from "../common/response.generator.js";
import { Env } from "../config/env.config.js";
import { PostsService } from "../services/posts.service.js";
import type { Pagination } from "../types/api/api.js";
import type { ValidatedEnv, PostRequestBody, PostsResponse } from "../types/index.js";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

class PostsController {
  private readonly _postService: PostsService;
  private readonly _env: ValidatedEnv;
  private readonly _logger: Logger;

  constructor() {
    this._postService = new PostsService();
    this._env = Env.instance.env;
    this._logger = new Logger("PostsController");
  }

  public async createPost(
    req: Request<{}, {}, PostRequestBody.Create>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const description: string = req.body.description;
      const payload: JwtPayload = req.payload!;

      await this._postService.createPost(payload.sub, description, req.files);
      this._logger.debug("Post Created");
      res.sendStatus(201);
    } catch (error: unknown) {
      next(error);
    }
  }

  public async getPosts(
    req: Request<{}, {}, {}, Pagination & { user_id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page, limit, sort, user_id } = req.query;
      const resposne: PostsResponse.GetPosts = await this._postService.getPosts(
        page,
        limit,
        sort,
        user_id,
      );
      res.status(200).json(ResponseGenerator.success("OK", resposne));
    } catch (error: unknown) {
      next(error);
    }
  }
}

export { PostsController };
