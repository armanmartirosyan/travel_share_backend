import { Router } from "express";
import { AuthController } from "../../controllers/auth.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { Validator } from "../../middlewares/validator.midlleware.js";

const authRouter: Router = Router();
const authController = new AuthController();

authRouter.post(
  "/registration",
  Validator.commonBodyFields(["email", "username", "password", "passwordConfirm"]),
  authController.userRegistration.bind(authController),
);
authRouter.post(
  "/login",
  Validator.commonBodyFields(["password"]),
  Validator.optionalBodyFields(["email", "username"]),
  authController.userLogin.bind(authController),
);
authRouter.post("/logout", authController.userLogout.bind(authController));
authRouter.post("/activate/:link", authController.userActivate.bind(authController));
authRouter.post("/verify", AuthMiddleware.authHandler());

export { authRouter };
