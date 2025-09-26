import { App } from "./app.js";
import { Logger } from "./common/logger.js";

const logger = new Logger("Index");
const app = new App();

await app.startup();

process.on("unhandledRejection", (reason: unknown, p: Promise<unknown>): void => {
  logger.error({ reason, p }, "Unhandled Rejection");
  process.exit(1);
});

process.on("uncaughtException", (error: Error): void => {
  logger.error({ error }, "Uncaught Exception thrown");
  process.exit(1);
});
