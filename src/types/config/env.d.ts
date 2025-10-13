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
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  SMTP_HOST: string;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
  SMTP_PORT: number;
  API_URL: string;
  MAIL_SERVICE_STATUS: string;
  MAIL_SERVICE: boolean;
};
