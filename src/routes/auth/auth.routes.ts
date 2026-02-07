import express, { Router } from "express";
import { Multer } from "../../common/multer.js";
import { AuthController } from "../../controllers/auth.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { Validator } from "../../middlewares/validator.midlleware.js";

const authRouter: Router = Router();
const authController = new AuthController();
const multer = Multer.instance;

authRouter.post(
  "/registration",
  Validator.body(["email", "username", "password", "passwordConfirm"]),
  authController.userRegistration.bind(authController),
);
authRouter.post(
  "/login",
  Validator.body(["login", "password"]),
  authController.userLogin.bind(authController),
);
authRouter.post("/logout", authController.userLogout.bind(authController));
authRouter.get("/activate/:link", authController.userActivate.bind(authController));
authRouter.get("/refresh", authController.userRefresh.bind(authController));
authRouter.post(
  "/forgot-password",
  Validator.body(["email"]),
  authController.forgotPassword.bind(authController),
);
authRouter.post(
  "/reset-password/:token",
  Validator.body(["password", "passwordConfirm"]),
  authController.resetPassword.bind(authController),
);
authRouter.post(
  "/upload/profile",
  AuthMiddleware.authHandler(),
  multer.upload.single("file"),
  authController.uploadProfilePicture.bind(authController),
);
authRouter.patch(
  "/update",
  AuthMiddleware.authHandler(),
  authController.updateUser.bind(authController),
);
authRouter.get("/:id", authController.getUser.bind(authController));

authRouter.use("/profile", express.static(multer.ProfileUploadPath));

export { authRouter };
