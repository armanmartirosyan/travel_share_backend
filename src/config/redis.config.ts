import { Redis } from "ioredis";
import { Env } from "./env.config.js";
import { Logger } from "../common/logger.js";
import type { RedisKey, RedisValue } from "ioredis";

class RedisService {
  static _instance: RedisService;

  private _client: Redis;
  private readonly _connectionUri: string;
  private readonly _logger: Logger;

  private constructor() {
    this._logger = new Logger("Redis.main");
    this._connectionUri = Env.instance.env.REDIS_URL;
    this._client = new Redis(this._connectionUri, {
      retryStrategy: (times: number): number | null => {
        if (times > 3) return null;
        return times * 1000;
      },
    });

    this._client.on("error", (err: Error): void => this._logger.error("Redis Client Error", err));
    this._client.on("connect", (): void => this._logger.info("Connected to Redis"));
    this._client.on("close", (): void => this._logger.info("Disconnected from Redis"));
  }

  static get instance(): RedisService {
    if (!RedisService._instance) RedisService._instance = new RedisService();
    return RedisService._instance;
  }

  public async set(key: RedisKey, value: RedisValue): Promise<string> {
    return this._client.set(key, value);
  }

  public async setEx(key: RedisKey, value: RedisValue, expiryInSeconds: number): Promise<string> {
    return this._client.set(key, value, "EX", expiryInSeconds);
  }

  public async get(key: RedisKey): Promise<string | null> {
    return this._client.get(key);
  }

  public async del(key: RedisKey): Promise<number> {
    return this._client.del(key);
  }

  public disconnect(): void {
    this._client.disconnect();
  }
}

export { RedisService };
