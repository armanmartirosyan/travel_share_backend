import { Router } from "express";
import { AuthController } from "../../controllers/auth.controller.js";

const authRouter: Router = Router();
const authController = new AuthController();

authRouter.post("/:id", authController.getUser.bind(authController));

export { authRouter };
