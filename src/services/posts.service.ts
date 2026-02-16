import { Types } from "mongoose";
import { Env } from "../config/env.config.js";
import { APIError } from "../errors/api.error.js";
import { Post, Follow } from "../models/index.model.js";
import type { IFollow, IPost } from "../models/index.model.js";
import type { PostsTypes as PT, PostsResponse, ValidatedEnv } from "../types/index.js";

class PostsService {
  private readonly _env: ValidatedEnv;

  constructor() {
    this._env = Env.instance.env;
  }

  public async createPost(
    userId: string | undefined,
    description: string,
    files: PT.Files,
  ): Promise<IPost> {
    if (!userId || !Types.ObjectId.isValid(userId)) throw APIError.UnauthorizedError();
    if (!files || files.length === 0) throw APIError.BadRequest("V400", "Missing media files.");
    if (!Array.isArray(files)) throw APIError.BadRequest("V400", "Invalid files format.");
    if (files.length > 5) throw APIError.BadRequest("V400", "Post can have at most 5 media items");
    if (description.length > 2000) throw APIError.BadRequest("V400", "Description too long");

    const media: PT.Media[] = [];

    for (const file of files) {
      media.push({ type: this.getMediaType(file), url: file.filename });
    }

    const post: IPost = new Post({
      userId: new Types.ObjectId(userId),
      description,
      media,
    });
    await post.save();
    return post;
  }

  public async getPosts(
    pageString: string,
    limitString: string,
    sort: string = "new",
    currentUserId?: string,
    userId?: string,
    feedType: PT.FeedType = "all",
  ): Promise<PostsResponse.GetPosts<IPost[]>> {
    const sortQueryList = new Map<string, Record<string, 1 | -1>>([
      ["new", { createdAt: -1 }],
      ["most_like", { likeCount: -1 }],
    ]);

    const page: number = Number(pageString);
    const limit: number = Number(limitString);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1)
      throw APIError.BadRequest("V400", "Invalid pagination parameters.");
    let sortQuery = sortQueryList.get(sort);
    if (!sortQuery) sortQuery = sortQueryList.get("new");

    const skip: number = (page - 1) * limit;
    const filter: { userId?: any } = {};

    if (userId) {
      filter.userId = userId;
    } else if (feedType === "following" && currentUserId) {
      if (!Types.ObjectId.isValid(currentUserId)) throw APIError.UnauthorizedError();

      const followingUsers: IFollow[] | null = await Follow.find({
        follower: new Types.ObjectId(currentUserId),
      })
        .select("following")
        .lean();

      const followingUserIds: Types.ObjectId[] = followingUsers.map(
        (f: IFollow): Types.ObjectId => f.following,
      );

      // followingUserIds.push(new Types.ObjectId(currentUserId));

      filter.userId = { $in: followingUserIds };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter).sort(sortQuery).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);

    return {
      posts,
      meta: {
        totalPosts: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  public async deletePost(id: string, userId: string | undefined): Promise<void> {
    if (!userId) throw APIError.UnauthorizedError();
    if (!Types.ObjectId.isValid(id)) throw APIError.BadRequest("B400", "Not valid Id");
    const post: IPost | null = await Post.findOne({ _id: id, userId });
    if (!post) return;
    await post.deleteOne();
  }

  private getMediaType(file: Express.Multer.File): "image" | "video" | "unknown" {
    if (file.mimetype.startsWith("image/")) return "image";
    if (file.mimetype.startsWith("video/")) return "video";
    return "unknown";
  }
}

export { PostsService };
