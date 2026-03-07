import { Logger } from "../common/logger.js";
import { ResponseGenerator } from "../common/response.generator.js";
import { Env } from "../config/env.config.js";
import { CommentDTO } from "../dto/comment.dto.js";
import { CommentService } from "../services/comment.service.js";
import type { IComment } from "../models/comment.model.js";
import type { ValidatedEnv, CommentRequestBody } from "../types/index.js";
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

  public async createPost(
    req: Request<{}, {}, CommentRequestBody.Create>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { postId, content, parentId } = req.body;
      const payload: JwtPayload = req.payload!;

      const resposne: IComment = await this._commentService.createPost(
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
}

export { CommentController };
