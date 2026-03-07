import type { IComment } from "../models/index.model.js";

class CommentDTO {
  _id: string;
  postId: string;
  userId: string;
  parentId?: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  replies: number;
  createdAt: Date;

  constructor(model: IComment) {
    this._id = model._id.toString();
    this.postId = model.postId.toString();
    this.userId = model.userId.toString();
    this.parentId = model.parentId?.toString();
    this.content = model.content;
    this.likeCount = model.likeCount;
    this.dislikeCount = model.dislikeCount;
    this.replies = model.replies.length;
    this.createdAt = model.createdAt;
  }
}

export { CommentDTO };
