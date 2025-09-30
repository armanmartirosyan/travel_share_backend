import mongoose from "mongoose";
import { Env } from "./env.config.js";
import { Logger } from "../common/logger.js";
import type { Connection } from "mongoose";

class DatabaseService {
  private static _instance: DatabaseService;

  private readonly _connectionUri: string;
  private readonly _logger: Logger;
  private readonly _maxRetries: number;
  private readonly _retryDelay: number;

  private constructor() {
    this._maxRetries = 3;
    this._retryDelay = 2000;
    this._connectionUri = Env.instance.env.MONGO_URL;
    this._logger = new Logger("DatabaseService");
  }

  public static get instance(): DatabaseService {
    if (!DatabaseService._instance) DatabaseService._instance = new DatabaseService();
    return DatabaseService._instance;
  }

  public async connect(): Promise<void> {
    for (let attempt: number = 1; attempt <= this._maxRetries; attempt++) {
      try {
        await mongoose.connect(this._connectionUri, {
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
        });

        this.addEventListeners();
        this._logger.info("Connected to MongoDB");
        return;
      } catch (error: unknown) {
        if (error instanceof mongoose.Error)
          this._logger.error("Mongoose error::" + error.name + "::" + error.message);
        else if (error instanceof Error) this._logger.error("Unknown error::" + error.message);
        else this._logger.error("Unexpected error during DB connection::", error);

        if (attempt < this._maxRetries) {
          this._logger.warn(`Retrying in ${this._retryDelay / 1000} seconds...`);
          await new Promise((res) => setTimeout(res, this._retryDelay));
        } else {
          this._logger.error("Max retries reached. Exiting...");
          process.exit(1);
        }
      }
    }
  }

  private addEventListeners(): void {
    const db: Connection = mongoose.connection;

    db.on("disconnected", (): void => {
      this._logger.warn("MongoDB disconnected");
    });

    db.on("reconnected", (): void => {
      this._logger.info("MongoDB reconnected");
    });

    db.on("error", (err: mongoose.Error): void => {
      this._logger.error("MongoDB error: " + err.message);
    });
  }
}

export { DatabaseService };
