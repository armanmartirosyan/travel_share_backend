export namespace CommentRequestBody {
  type Create = {
    postId: string;
    parentId?: string;
    content: string;
  };

  type React = {
    type: "like" | "dislike";
  };
}

export namespace CommentParams {
  type PostId = {
    postId: string;
  };

  type CommentId = {
    id: string;
  };
}

export namespace CommentQueryParams {
  type GetComments = { parentId?: string };
}

export namespace CommentsResponse {
  type GetComments<T> = {
    comments: T;
    meta: {
      totalComments: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}
