import express from "express";
import { Env } from "./config/env.config.js";
import type { ValidatedEnv } from "./types/index.js";
import type { Express, Request, Response } from "express";

const env: ValidatedEnv = Env.getInstance().env;

const app: Express = express();

// app.get("/", (req: Request, res: Response) => {
// 	req;
// 	return res.json({
// 		error: false,
// 		message: "Message",
// 	});
// });

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`App is running on port ${env.PORT}`);
});
