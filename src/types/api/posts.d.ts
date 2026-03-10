export namespace PostRequestBody {
  type Create = {
    description: string;
  };

  type React = {
    type: "like" | "dislike";
  };
}

export namespace PostsParams {
  type PostId = {
    id: string;
  };
}

export namespace PostsTypes {
  type Files =
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[]
    | undefined;

  type Media = {
    type: string;
    url: string;
  };

  type PaginationInfo = {
    user_id?: string;
    feed_type?: FeedType;
  };
  type FeedType = "all" | "following";
}

export namespace PostsResponse {
  type GetPosts<T> = {
    posts: T;
    meta: {
      totalPosts: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}
