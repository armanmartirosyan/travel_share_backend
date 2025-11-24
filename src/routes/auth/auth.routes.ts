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
  authController.userLogin.bind(authController),
);
authRouter.post("/logout", authController.userLogout.bind(authController));
authRouter.get("/activate/:link", authController.userActivate.bind(authController));
authRouter.get("/refresh", authController.userRefresh.bind(authController));
authRouter.post("/verify", AuthMiddleware.authHandler());
authRouter.post(
  "/forgot-password",
  Validator.commonBodyFields(["email"]),
  authController.forgotPassword.bind(authController),
);
// authRouter.post("/reset-password")

export { authRouter };
