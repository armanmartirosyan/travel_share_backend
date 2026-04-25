import { Router } from "express";
import { FollowController } from "../../controllers/follow.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";

const followRouter: Router = Router();
const followController: FollowController = new FollowController();

followRouter.post(
  "/:followingId",
  AuthMiddleware.authHandler(),
  followController.createFollow.bind(followController),
);
followRouter.delete(
  "/:followingId",
  AuthMiddleware.authHandler(),
  followController.deleteFollow.bind(followController),
);
followRouter.get("/followers/:userId", followController.getFollowers.bind(followController));
followRouter.get("/following/:userId", followController.getFollowing.bind(followController));

export { followRouter };
