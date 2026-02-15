import type { IMedia } from "../models/media.model.js";
import type { IPost } from "../models/post.model.js";

class PostDTO {
  _id: string;
  userId: string;
  description?: string;
  media: IMedia[];
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;

  constructor(model: IPost) {
    this._id = model._id.toString();
    this.userId = model.userId.toString();
    this.description = model.description;
    this.media = model.media;
    this.likeCount = model.likeCount;
    this.dislikeCount = model.dislikeCount;
    this.createdAt = model.createdAt;
  }
}

export { PostDTO };
