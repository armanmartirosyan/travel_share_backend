import { Router } from "express";
import { authRouter } from "./auth/auth.routes.js";
import { commentRouter } from "./comment/comment.routes.js";
import { postRouter } from "./posts/posts.routes.js";

const mainRouter: Router = Router();

mainRouter.use("/user", authRouter);
mainRouter.use("/posts", postRouter);
mainRouter.use("/comment", commentRouter);

export { mainRouter };
