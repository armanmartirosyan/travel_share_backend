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
  commentController.createPost.bind(commentController),
);
// commentRouter.get(
//   "/",
//   AuthMiddleware.authHandler(true),
//   Validator.query(["page", "limit"]),
//   commentController.getPosts.bind(commentController),
// );
// commentRouter.delete(
//   "/:id",
//   AuthMiddleware.authHandler(),
//   commentController.deletePost.bind(commentController),
// );

export { commentRouter };
