import type { IPost } from "../../models/index.model.ts";
export namespace PostRequestBody {
  type Create = {
    description: string;
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
}

export namespace PostsResponse {
  type GetPosts = {
    posts: IPost[];
    meta: {
      totalPosts: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
}
