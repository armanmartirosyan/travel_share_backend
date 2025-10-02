import { Router } from "express";
import { AuthController } from "../../controllers/auth.controller.js";
import { Validator } from "../../middlewares/validator.midlleware.js";

const authRouter: Router = Router();
const authController = new AuthController();

authRouter.post(
  "/registration",
  Validator.commonBodyValidations(["email", "username", "password", "passwordConfirm"]),
  authController.userRegistration.bind(authController),
);

export { authRouter };
