import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { Logger } from "./common/logger.js";
import { DatabaseService } from "./config/database.config.js";
import { Env } from "./config/env.config.js";
import { RedisService } from "./config/redis.config.js";
import { ErrorMiddleware } from "./middlewares/error.middleware.js";
import { mainRouter } from "./routes/index.js";
import type { ValidatedEnv } from "./types/index.js";
import type { RequestHandler, Express, Request, Response, NextFunction } from "express";

class App {
  private readonly _app: Express;
  private readonly HTTP_PORT: number;
  private readonly HOST: string;
  private readonly MODE: string;

  private readonly _env: ValidatedEnv;
  private readonly _logger: Logger;
  private readonly _database: DatabaseService;
  private readonly _redis: RedisService;

  constructor() {
    this._logger = new Logger("App.Main");
    this._env = Env.instance.env;
    this.HTTP_PORT = this._env.PORT;
    this.MODE = this._env.NODE_ENV;
    this.HOST = "0.0.0.0";
    this._app = express();
    this._database = DatabaseService.instance;
    this._redis = RedisService.instance;
  }

  async startup(): Promise<void> {
    this.configureRoutes();
    await this._database.connect();
    await this.serverListen();
  }

  private async serverListen(): Promise<void> {
    this._app.listen(this.HTTP_PORT, this.HOST, (): void => {
      this._logger.info(
        `App is listening on the port ${this.HTTP_PORT} on host ${this.HOST} on ${this.MODE} mode`,
      );
    });
  }

  private configureRoutes(): void {
    this._app.use(express.json());
    this._app.use(cookieParser());
    this._app.use(
      cors({
        origin: this._env.CLIENT_URL,
        credentials: true,
      }),
    );
    this._app.use(this.configureDumper());
    this._app.use("/api", mainRouter);
    this._app.use(ErrorMiddleware.ErrorHandler());
  }

  private configureDumper(): RequestHandler {
    const filename: string = path.join(this._env.LOG_PATH, new Date().toISOString().split("T")[0]);

    function handler(req: Request, res: Response, next: NextFunction): void {
      res.on("finish", (): void => {
        if (res.statusCode < 500) return;
        const dump = {
          url: req.originalUrl,
          ip: req.ip,
          timestamp: new Date().toISOString(),
          method: req.method,
          statusCode: res.statusCode,
          headers: req.headers,
          body: req.body,
          query: req.query,
          params: req.params,
        };

        fs.appendFile(filename + ".log", JSON.stringify(dump) + "\r\n", (err) => {
          if (err) console.error("Failed to write request log:", err);
        });
      });

      next();
    }
    return handler;
  }
}

export { App };
