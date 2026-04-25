import { Types } from "mongoose";
import { APIError } from "../errors/api.error.js";
import { Follow, User } from "../models/index.model.js";
import type { IFollow } from "../models/follow.model.js";
import type { IUser } from "../models/user.model.js";
import type { Follower, FollowResponse, Following } from "../types/api/follow.js";

class FollowService {
  public async createFollow(
    userId: string | undefined,
    targetUserId: string | undefined,
  ): Promise<void> {
    if (!userId || !Types.ObjectId.isValid(userId)) throw APIError.UnauthorizedError();
    if (!targetUserId || !Types.ObjectId.isValid(targetUserId))
      throw APIError.BadRequest("M400", "Valid target user id is required.");
    if (userId === targetUserId) throw APIError.BadRequest("V400", "You cannot follow yourself.");

    const targetUser: IUser | null = await User.findById(targetUserId).select("_id");
    if (!targetUser) throw APIError.NotFound("N404", "Target user not found.");

    const existingFollow: IFollow | null = await Follow.findOne({
      follower: userId,
      following: targetUserId,
    });
    if (existingFollow) throw APIError.BadRequest("V400", "Follow relationship already exists.");

    const follow: IFollow = new Follow({
      follower: userId,
      following: targetUserId,
    });
    await follow.save();
  }

  public async deleteFollow(followingId: string, userId: string | undefined): Promise<void> {
    if (!followingId || !Types.ObjectId.isValid(followingId)) throw APIError.BadRequest("M400", "Valid follow id is required.");
    if (!userId || !Types.ObjectId.isValid(userId)) throw APIError.UnauthorizedError();

    const follow: IFollow | null = await Follow.findOne({ follower: userId, following: followingId });
    if (!follow) return;
    await follow.deleteOne();
  }

  public async getFollowers(userId: string): Promise<FollowResponse.GetFollowers> {
    if (!Types.ObjectId.isValid(userId)) throw APIError.BadRequest("V400", "Not valid user id.");

    const followersRaw: IFollow[] = await Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .populate("follower", "_id username name surname profilePicture");

    const followers: Follower[] = followersRaw.map((follow: IFollow): Follower => {
      const followerUser: IUser = follow.follower as unknown as IUser;
      return {
        followId: follow._id.toString(),
        id: followerUser._id.toString(),
        username: followerUser.username,
        name: followerUser.name,
        surname: followerUser.surname,
        profilePicture: followerUser.profilePicture,
        followedAt: follow.createdAt,
      };
    });

    return {
      followers,
      total: followers.length,
    };
  }

  public async getFollowing(userId: string): Promise<FollowResponse.GetFollowing> {
    if (!Types.ObjectId.isValid(userId)) throw APIError.BadRequest("V400", "Not valid user id.");

    const followingRaw: IFollow[] = await Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .populate("following", "_id username name surname profilePicture");

    const following: Following[] = followingRaw.map((follow: IFollow): Following => {
      const followedUser: IUser = follow.following as unknown as IUser;
      return {
        followId: follow._id.toString(),
        id: followedUser._id.toString(),
        username: followedUser.username,
        name: followedUser.name,
        surname: followedUser.surname,
        profilePicture: followedUser.profilePicture,
        followedAt: follow.createdAt,
      };
    });

    return {
      following,
      total: following.length,
    };
  }
}

export { FollowService };
