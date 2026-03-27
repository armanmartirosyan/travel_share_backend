import { Types } from "mongoose";
import { Env } from "../config/env.config.js";
import { APIError } from "../errors/api.error.js";
import { CommentReactionModel } from "../models/comment.reaction.model.js";
import { Comment } from "../models/index.model.js";
import type { CommentReactionType, ICommentReaction } from "../models/comment.reaction.model.js";
import type { IComment } from "../models/index.model.js";
import type { CommentsResponse } from "../types/api/comment.js";
import type { ValidatedEnv } from "../types/index.js";

class CommentService {
  private readonly _env: ValidatedEnv;

  constructor() {
    this._env = Env.instance.env;
  }

  public async createComment(
    userId: string | undefined,
    postId: string,
    content: string,
    parentId?: string,
  ): Promise<IComment> {
    if (!userId || !Types.ObjectId.isValid(userId)) throw APIError.UnauthorizedError();
    if (!Types.ObjectId.isValid(postId)) throw APIError.BadRequest("V400", "Not valid post id.");
    let parentComment: IComment | null = null;
    if (parentId) {
      if (!Types.ObjectId.isValid(parentId))
        throw APIError.BadRequest("V400", "Not valid parent id.");
      parentComment = await Comment.findById(parentId);
      if (!parentComment) throw APIError.BadRequest("V400", "Not valid parent id.");
    }
    const comment = new Comment({
      postId,
      user: userId,
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

  public async getComments(
    pageString: string,
    limitString: string,
    postId: string,
    sort: string = "new",
    parentId?: string,
    currentUserId?: string,
  ): Promise<CommentsResponse.GetComments<IComment[]>> {
    if (!Types.ObjectId.isValid(postId)) throw APIError.BadRequest("V400", "Not valid post id.");

    const sortQueryList = new Map<string, Record<string, 1 | -1>>([
      ["new", { createdAt: -1 }],
      ["most_like", { likeCount: -1 }],
    ]);
    const page: number = Number(pageString);
    const limit: number = Number(limitString);
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1)
      throw APIError.BadRequest("V400", "Invalid pagination parameters.");

    const normalizedParentId: string | undefined = parentId?.trim() || undefined;
    if (normalizedParentId && !Types.ObjectId.isValid(normalizedParentId))
      throw APIError.BadRequest("V400", "Not valid parent id.");

    let sortQuery: Record<string, 1 | -1> | undefined = sortQueryList.get(sort);
    if (!sortQuery) sortQuery = sortQueryList.get("new");

    const commentFilter: { postId: string; parentId: string | null } = {
      postId,
      parentId: normalizedParentId ?? null,
    };

    const skip: number = (page - 1) * limit;
    const [comments, totalComments] = await Promise.all([
      Comment.find(commentFilter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate("user", "_id username profilePicture")
        .populate("replies"),
      Comment.countDocuments(commentFilter),
    ]);

    const userReactions: Map<string, "like" | "dislike" | null> = new Map();
    if (currentUserId && Types.ObjectId.isValid(currentUserId)) {
      const commentIds: string[] = comments.map((c: IComment): string => c._id.toString());
      const reactions: ICommentReaction[] = await CommentReactionModel.find({
        userId: new Types.ObjectId(currentUserId),
        targetId: { $in: commentIds },
      })
        .select("targetId type")
        .lean();

      reactions.forEach((reaction: ICommentReaction): void => {
        userReactions.set(reaction.targetId.toString(), reaction.type);
      });
    }
    for (const comment of comments)
      comment.userReaction = userReactions.get(comment._id.toString()) || null;

    return {
      comments,
      meta: {
        totalComments,
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        hasNextPage: page * limit < totalComments,
      },
    };
  }

  public async reactToComment(
    commentId: string,
    userId: string | undefined,
    type: CommentReactionType,
  ): Promise<void> {
    if (type !== "like" && type !== "dislike")
      throw APIError.BadRequest("V400", "Invalid reaction type");
    if (!userId) throw APIError.UnauthorizedError();
    if (!Types.ObjectId.isValid(commentId)) throw APIError.BadRequest("B400", "Not valid Id");

    const comment: IComment | null = await Comment.findById(commentId);
    if (!comment) throw APIError.NotFound("N404", "Comment not found");

    const existingReaction: ICommentReaction | null = await CommentReactionModel.findOne({
      userId: new Types.ObjectId(userId),
      targetId: comment._id,
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await existingReaction.deleteOne();
        comment.likeCount += type === "like" ? -1 : 0;
        comment.dislikeCount += type === "dislike" ? -1 : 0;
      } else {
        existingReaction.type = type;
        await existingReaction.save();
        comment.likeCount += type === "like" ? 1 : -1;
        comment.dislikeCount += type === "dislike" ? 1 : -1;
      }
    } else {
      const newReaction = new CommentReactionModel({
        userId: new Types.ObjectId(userId),
        targetId: comment._id,
        type,
      });
      await newReaction.save();
      comment.likeCount += type === "like" ? 1 : 0;
      comment.dislikeCount += type === "dislike" ? 1 : 0;
    }

    await comment.save();
  }

  public async deleteComment(commentId: string, userId: string | undefined): Promise<void> {
    if (!userId) throw APIError.UnauthorizedError();
    if (!Types.ObjectId.isValid(commentId)) throw APIError.BadRequest("B400", "Not valid Id");
    const comment: IComment | null = await Comment.findOne({ _id: commentId, user: userId });
    await Comment.deleteMany({ parentId: commentId });
    await CommentReactionModel.deleteMany({ targetId: commentId });
    if (!comment) return;
    await comment.deleteOne();
  }
}

export { CommentService };
