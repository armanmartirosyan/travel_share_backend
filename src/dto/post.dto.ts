import type { IMedia } from "../models/media.model.js";
import type { IPost, IPostUser } from "../models/post.model.js";

class PostDTO {
  _id: string;
  user: IPostUser;
  description?: string;
  media: IMedia[];
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;

  constructor(model: IPost) {
    this._id = model._id.toString();
    this.user = model.user;
    this.description = model.description;
    this.media = model.media;
    this.likeCount = model.likeCount;
    this.dislikeCount = model.dislikeCount;
    this.createdAt = model.createdAt;
  }
}

export { PostDTO };
