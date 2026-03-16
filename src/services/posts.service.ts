import { Types } from "mongoose";
import { Env } from "../config/env.config.js";
import { APIError } from "../errors/api.error.js";
import { Post, Follow, User } from "../models/index.model.js";
import { PostReactionModel } from "../models/post.reaction.model.js";
import type { IFollow, IPost } from "../models/index.model.js";
import type { IPostReaction, PostReactionType } from "../models/post.reaction.model.js";
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

    const userObjectId = new Types.ObjectId(userId);
    const user = await User.findById(userObjectId).select("_id username profilePicture");
    if (!user) throw APIError.NotFound("N404", "User not found");

    const media: PT.Media[] = [];

    for (const file of files) {
      media.push({ type: this.getMediaType(file), url: file.filename });
    }

    const post: IPost = new Post({
      user: userObjectId,
      description,
      media,
    });
    await post.save();

    await post.populate("user", "_id username profilePicture");
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
    let sortQuery: Record<string, 1 | -1> | undefined = sortQueryList.get(sort);
    if (!sortQuery) sortQuery = sortQueryList.get("new");

    const skip: number = (page - 1) * limit;
    const filter: { user?: any } = {};

    if (userId) {
      filter.user = userId;
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

      filter.user = { $in: followingUserIds };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("user", "_id username profilePicture")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    const userReactions: Map<string, "like" | "dislike" | null> = new Map();
    if (currentUserId && Types.ObjectId.isValid(currentUserId)) {
      const postIds: Types.ObjectId[] = posts.map((post: IPost): Types.ObjectId => post._id);
      const reactions: IPostReaction[] = await PostReactionModel.find({
        userId: new Types.ObjectId(currentUserId),
        targetId: { $in: postIds },
      })
        .select("targetId type")
        .lean();

      reactions.forEach((reaction: IPostReaction): void => {
        userReactions.set(reaction.targetId.toString(), reaction.type);
      });
    }
    for (const post of posts) post.userReaction = userReactions.get(post._id.toString()) || null;

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

  public async getPostById(id: string, currentUserId?: string): Promise<IPost> {
    if (!Types.ObjectId.isValid(id)) throw APIError.BadRequest("B400", "Not valid Id");
    const post: IPost | null = await Post.findById(id).populate(
      "user",
      "_id username profilePicture",
    );
    if (currentUserId && Types.ObjectId.isValid(currentUserId) && post) {
      const reaction: IPostReaction | null = await PostReactionModel.findOne({
        userId: new Types.ObjectId(currentUserId),
        targetId: post._id,
      }).select("type");
      post.userReaction = reaction ? reaction.type : null;
    }
    if (!post) throw APIError.NotFound("N404", "Post not found");
    return post;
  }

  public async deletePost(id: string, userId: string | undefined): Promise<void> {
    if (!userId) throw APIError.UnauthorizedError();
    if (!Types.ObjectId.isValid(id)) throw APIError.BadRequest("B400", "Not valid Id");
    const post: IPost | null = await Post.findOne({ _id: id, user: userId });
    if (!post) throw APIError.UnauthorizedError();
    await post.deleteOne();
  }

  public async reactToPost(
    postId: string,
    userId: string | undefined,
    type: PostReactionType,
  ): Promise<void> {
    if (type !== "like" && type !== "dislike")
      throw APIError.BadRequest("V400", "Invalid reaction type");
    if (!userId) throw APIError.UnauthorizedError();
    if (!Types.ObjectId.isValid(postId)) throw APIError.BadRequest("B400", "Not valid Id");

    const post: IPost | null = await Post.findById(postId);
    if (!post) throw APIError.NotFound("N404", "Post not found");

    const existingReaction: IPostReaction | null = await PostReactionModel.findOne({
      userId: new Types.ObjectId(userId),
      targetId: post._id,
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction
        await existingReaction.deleteOne();
        post.likeCount += type === "like" ? -1 : 0;
        post.dislikeCount += type === "dislike" ? -1 : 0;
      } else {
        // Change reaction
        existingReaction.type = type;
        await existingReaction.save();
        post.likeCount += type === "like" ? 1 : -1;
        post.dislikeCount += type === "dislike" ? 1 : -1;
      }
    } else {
      // Add new reaction
      const newReaction = new PostReactionModel({
        userId: new Types.ObjectId(userId),
        targetId: post._id,
        type,
      });
      await newReaction.save();
      post.likeCount += type === "like" ? 1 : 0;
      post.dislikeCount += type === "dislike" ? 1 : 0;
    }

    await post.save();
  }

  private getMediaType(file: Express.Multer.File): "image" | "video" | "unknown" {
    if (file.mimetype.startsWith("image/")) return "image";
    if (file.mimetype.startsWith("video/")) return "video";
    return "unknown";
  }
}

export { PostsService };
