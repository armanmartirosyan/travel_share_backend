import express, { Router } from "express";
import { Types } from "mongoose";
import { Multer } from "../../common/multer.js";
import { PostsController } from "../../controllers/posts.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { Validator } from "../../middlewares/validator.midlleware.js";
import { ReactionModel } from "../../models/reaction.model.js";
import type { Request } from "express";

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
  AuthMiddleware.authHandler(true),
  Validator.query(["page", "limit"]),
  postController.getPosts.bind(postController),
);
postRouter.get(
  "/:id",
  AuthMiddleware.authHandler(true),
  postController.getPostById.bind(postController),
);
postRouter.delete(
  "/:id",
  AuthMiddleware.authHandler(),
  postController.deletePost.bind(postController),
);
postRouter.post("/:id/react", AuthMiddleware.authHandler(false), async (req: Request, res) => {
  await new ReactionModel({
    userId: new Types.ObjectId(req.payload!.sub!),
    targetId: new Types.ObjectId(req.params.id),
    targetType: "Post",
    type: req.query.type,
  }).save();
  res.status(200).json();
});

postRouter.use("/media", express.static(multer.PostsUploadPath));

export { postRouter };
