import { Router } from "express";
import { CommentController } from "../../controllers/comment.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { Validator } from "../../middlewares/validator.midlleware.js";

const commentRouter: Router = Router();
const commentController = new CommentController();

commentRouter.post(
  "/create",
  Validator.body(["postId", "content"]),
  AuthMiddleware.authHandler(),
  commentController.createComment.bind(commentController),
);
commentRouter.get(
  "/:postId",
  AuthMiddleware.authHandler(true),
  Validator.query(["page", "limit"]),
  commentController.getComments.bind(commentController),
);
commentRouter.post(
  "/:id/react",
  AuthMiddleware.authHandler(),
  Validator.body(["type"]),
  commentController.reactToComment.bind(commentController),
);
commentRouter.delete(
  "/:id",
  AuthMiddleware.authHandler(),
  commentController.deletePost.bind(commentController),
);

export { commentRouter };
