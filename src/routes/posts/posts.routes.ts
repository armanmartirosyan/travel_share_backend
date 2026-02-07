import express, { Router } from "express";
import { Multer } from "../../common/multer.js";
import { PostsController } from "../../controllers/posts.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { Validator } from "../../middlewares/validator.midlleware.js";

const postRouter: Router = Router();
const postController = new PostsController();
const multer = Multer.instance;

postRouter.post(
  "/create",
  multer.upload.array("files", 5),
  Validator.body(["description"]),
  AuthMiddleware.authHandler(),
  postController.createPost.bind(postController),
);
postRouter.get(
  "/",
  Validator.query(["page", "limit"]),
  postController.getPosts.bind(postController),
);

postRouter.use("/media", express.static(multer.PostsUploadPath));

export { postRouter };
