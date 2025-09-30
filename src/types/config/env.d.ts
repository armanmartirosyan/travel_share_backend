export type EnvList = {
  number: string[];
  string: string[];
};

export type ValidatedEnv = {
  PORT: number;
  LOG_LEVEL: string;
  NODE_ENV: string;
  CLIENT_URL: string;
  MONGO_URL: string;
  REDIS_URL: string;
  LOG_PATH: string;
  ISDEV: boolean;
};
