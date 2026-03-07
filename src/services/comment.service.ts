import { Types } from "mongoose";
import { Env } from "../config/env.config.js";
import { APIError } from "../errors/api.error.js";
import { Comment } from "../models/index.model.js";
import type { IComment } from "../models/index.model.js";
import type { ValidatedEnv } from "../types/index.js";

class CommentService {
  private readonly _env: ValidatedEnv;

  constructor() {
    this._env = Env.instance.env;
  }

  public async createPost(
    userId: string | undefined,
    postId: string,
    content: string,
    parentId?: string,
  ): Promise<IComment> {
    if (!userId || !Types.ObjectId.isValid(userId)) throw APIError.UnauthorizedError();
    if (!Types.ObjectId.isValid(postId)) throw APIError.BadRequest("V400", "Not valid post id.");
    let parentComment: IComment | null = null;
    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) throw APIError.BadRequest("V400", "Not valid parent id.");
      parentComment = await Comment.findById(parentId);
      if (!parentComment) throw APIError.BadRequest("V400", "Not valid parent id.");
    }
    const comment = new Comment({
      postId,
      userId,
      parentId: parentId ?? null,
      content,
    });
    if (parentComment) {
      parentComment.replies.push(comment.id);
      await parentComment.save();
    }
    await comment.save();
    return comment;
  }
}

export { CommentService };
