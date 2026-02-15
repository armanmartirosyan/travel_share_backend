import { Logger } from "../common/logger.js";
import { ResponseGenerator } from "../common/response.generator.js";
import { Env } from "../config/env.config.js";
import { PostDTO } from "../dto/post.dto.js";
import { PostsService } from "../services/posts.service.js";
import type { IPost } from "../models/post.model.js";
import type { Pagination } from "../types/api/api.js";
import type {
  ValidatedEnv,
  PostsParams,
  PostRequestBody,
  PostsResponse,
  PostsTypes,
} from "../types/index.js";
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

      const response: IPost = await this._postService.createPost(
        payload.sub,
        description,
        req.files,
      );
      const postDTO: PostDTO = new PostDTO(response);
      this._logger.debug("Post Created");
      res.status(201).json(ResponseGenerator.success<PostDTO>("OK", postDTO));
    } catch (error: unknown) {
      next(error);
    }
  }

  public async getPosts(
    req: Request<{}, {}, {}, Pagination & PostsTypes.PaginationInfo>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page, limit, sort, user_id, feed_type } = req.query;
      const currentUserId: string | undefined = req.payload?.sub;
      const feedType: PostsTypes.FeedType = feed_type || "all";

      const resposne: PostsResponse.GetPosts<IPost[]> = await this._postService.getPosts(
        page,
        limit,
        sort,
        currentUserId,
        user_id,
        feedType,
      );
      const postsDTOs: PostDTO[] = [];
      for (const post of resposne.posts) postsDTOs.push(new PostDTO(post));

      res.status(200).json(
        ResponseGenerator.success<PostsResponse.GetPosts<PostDTO[]>>("OK", {
          posts: postsDTOs,
          meta: resposne.meta,
        }),
      );
    } catch (error: unknown) {
      next(error);
    }
  }

  public async deletePost(
    req: Request<PostsParams.PostId>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      await this._postService.deletePost(id, req.payload!.sub);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }
}

export { PostsController };
