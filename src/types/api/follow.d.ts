export type FollowRecord = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
};

export type FollowUser = {
  id: string;
  username: string;
  name?: string;
  surname?: string;
  profilePicture?: string;
};

export type Follower = FollowUser & {
  followId: string;
  followedAt: Date;
};

export type Following = FollowUser & {
  followId: string;
  followedAt: Date;
};

export namespace FollowParams {
  type Id = {
    followingId: string;
  };

  type UserId = {
    userId: string;
  };
}

export namespace FollowResponse {
  type GetFollowers = {
    followers: Follower[];
    total: number;
  };

  type GetFollowing = {
    following: Following[];
    total: number;
  };
}
