import { Logger } from "../common/logger.js";
import { ResponseGenerator } from "../common/response.generator.js";
import { Env } from "../config/env.config.js";
import { CommentDTO } from "../dto/comment.dto.js";
import { CommentService } from "../services/comment.service.js";
import type { IComment } from "../models/comment.model.js";
import type { Pagination } from "../types/api/api.js";
import type { CommentParams, CommentsResponse } from "../types/api/comment.js";
import type { ValidatedEnv, CommentRequestBody, CommentQueryParams } from "../types/index.js";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

class CommentController {
  private readonly _commentService: CommentService;
  private readonly _env: ValidatedEnv;
  private readonly _logger: Logger;

  constructor() {
    this._commentService = new CommentService();
    this._env = Env.instance.env;
    this._logger = new Logger("CommentController");
  }

  public async createComment(
    req: Request<{}, {}, CommentRequestBody.Create>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { postId, content, parentId } = req.body;
      const payload: JwtPayload = req.payload!;

      const resposne: IComment = await this._commentService.createComment(
        payload.sub,
        postId,
        content,
        parentId,
      );
      const commentDTO: CommentDTO = new CommentDTO(resposne);
      this._logger.debug("Comment Created");
      res.status(201).json(ResponseGenerator.success<CommentDTO>("OK", commentDTO));
    } catch (error: unknown) {
      next(error);
    }
  }

  public async getComments(
    req: Request<CommentParams.PostId, {}, {}, Pagination & CommentQueryParams.GetComments>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page, limit, sort, parentId } = req.query;
      const payload: JwtPayload | undefined = req.payload;
      const { postId } = req.params;

      const resposne: CommentsResponse.GetComments<IComment[]> =
        await this._commentService.getComments(page, limit, postId, sort, parentId, payload?.sub);
      const commentDTOs: CommentDTO[] = [];
      for (const comment of resposne.comments) commentDTOs.push(new CommentDTO(comment));

      res.status(200).json(
        ResponseGenerator.success<CommentsResponse.GetComments<CommentDTO[]>>("OK", {
          comments: commentDTOs,
          meta: resposne.meta,
        }),
      );
      this._logger.debug("Comments Retrieved");
    } catch (error: unknown) {
      next(error);
    }
  }

  public async reactToComment(
    req: Request<CommentParams.CommentId, {}, CommentRequestBody.React>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const type: CommentRequestBody.React["type"] = req.body.type;
      const { id } = req.params;
      const userId: string | undefined = req.payload!.sub;
      await this._commentService.reactToComment(id, userId, type);
      this._logger.debug("Comment Reacted To");
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  public async deletePost(
    req: Request<CommentParams.CommentId>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId: string | undefined = req.payload!.sub;
      await this._commentService.deleteComment(id, userId);
      this._logger.debug("Comment Deleted");
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }
}

export { CommentController };
