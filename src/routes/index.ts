import { Router } from "express";
import { authRouter } from "./auth/auth.routes.js";

const mainRouter: Router = Router();

mainRouter.use("/user", authRouter);

export { mainRouter };
