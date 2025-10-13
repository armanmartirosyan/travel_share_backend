import path from "node:path";
import dotenv from "dotenv";

import { Logger } from "../common/logger.js";
import type { EnvList, ValidatedEnv } from "../types/index.js";

class Env {
  private static _instance: Env;

  private readonly _logger: Logger;
  private readonly _env: ValidatedEnv;

  public static get instance(): Env {
    if (!Env._instance) Env._instance = new Env();
    return Env._instance;
  }

  get env(): ValidatedEnv {
    return this._env;
  }

  private constructor() {
    this._logger = new Logger("Env.config");
    dotenv.config({
      path: `${path.resolve(import.meta.dirname, "../../.env")}`,
      quiet: true,
    });
    this._env = this.validateEnv();
  }

  private validateEnv(): ValidatedEnv {
    const requiredEnv: EnvList = {
      number: ["PORT", "SMTP_PORT"],
      string: [
        "LOG_LEVEL",
        "NODE_ENV",
        "CLIENT_URL",
        "MONGO_URL",
        "LOG_PATH",
        "REDIS_URL",
        "ACCESS_TOKEN_SECRET",
        "REFRESH_TOKEN_SECRET",
        "SMTP_HOST",
        "SMTP_USERNAME",
        "SMTP_PASSWORD",
        "API_URL",
        "MAIL_SERVICE_STATUS",
      ],
    };
    const env: ValidatedEnv = {} as ValidatedEnv;
    const missingVars: string[] = [];

    for (const val of requiredEnv.number) {
      if (!process.env[val]) missingVars.push(val);
      else {
        (env as any)[val] = Number(process.env[val]);
      }
    }
    for (const val of requiredEnv.string) {
      if (!process.env[val]) missingVars.push(val);
      else {
        (env as any)[val] = process.env[val];
      }
    }
    if (missingVars.length > 0) {
      this._logger.error(
        `Missing required environment variables: ${missingVars.join(", ")}. Please check your .env file or environment setup.`,
      );
      process.exit(1);
    }
    this._logger.info(".env file loaded successfully");
    env.ISDEV = process.env.NODE_ENV !== "production";
    env.MAIL_SERVICE = process.env.MAIL_SERVICE_STATUS === "enable";
    return env;
  }
}

export { Env };
