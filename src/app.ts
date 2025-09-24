import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { Logger } from "./common/logger.js";
import { Env } from "./config/env.config.js";
import { mainRouter } from "./routes/index.js";
import type { Express } from "express";

class App {
  private readonly _app: Express;
  private readonly HTTP_PORT: number;
  private readonly HOST: string;
  private readonly MODE: string;

  private readonly _env: Env;
  private readonly _logger: Logger;

  constructor() {
    this._logger = new Logger("App.Main");
    this._env = Env.getInstance;
    this.HTTP_PORT = this._env.env.PORT;
    this.MODE = this._env.env.NODE_ENV;
    this.HOST = "0.0.0.0";
    this._app = express();
  }

  private configureRoutes(): void {
    this._app.use(express.json());
    this._app.use(cookieParser());
    this._app.use(
      cors({
        credentials: true,
        origin: process.env.CLIENT_URL,
      }),
    );
    this._app.use("/api", mainRouter);
  }

  startup(): void {
    this.configureRoutes();
    this._app.listen(this.HTTP_PORT, this.HOST, (): void => {
      this._logger.info(
        `App is listening on the port ${this.HTTP_PORT} on host ${this.HOST} on ${this.MODE} mode`,
      );
    });
  }
}

export { App };
