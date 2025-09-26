export type EnvList = {
  number: string[];
  string: string[];
};

export type ValidatedEnv = {
  PORT: number;
  LOG_LEVEL: string;
  NODE_ENV: string;
  CLIENT_URL: string;
  MONGO_CONNECTION_STRING: string;
};
