export namespace CommentRequestBody {
  type Create = {
    postId: string;
    parentId?: string;
    content: string;
  };
}
