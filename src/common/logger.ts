import type { MethodMapType, ColorType } from "../types/index.d.js";

class Logger {
  private readonly levels: string[];
  private readonly level: string;
  private readonly threshold: number;
  private readonly methodMap: MethodMapType;
  private readonly colors: ColorType;
  private readonly prefix: string;

  constructor(prefix: string) {
    this.levels = ["debug", "info", "warn", "error"];
    this.level = process.env.LOG_LEVEL || "debug";
    this.threshold = this.levels.indexOf(this.level);
    this.methodMap = {
      info: console.log,
      warn: console.warn,
      debug: console.debug,
      error: console.error,
    };
    this.colors = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      reset: "\x1b[0m", // Reset to default
    };
    this.prefix = prefix;
  }

  private _log(type: string, ...args: any[]): void {
    if (this.levels.indexOf(type) < this.threshold) return;
    const color: string = this.colors[type as keyof ColorType];
    const reset: string = this.colors.reset;
    const level: string = `${color}${this.prefix}::[${type.toUpperCase()}]${reset}`;

    this.methodMap[type as keyof MethodMapType](level, ...args);
  }

  public debug(...args: any[]): void {
    this._log("debug", ...args);
  }

  public info(...args: any[]): void {
    this._log("info", ...args);
  }

  public warn(...args: any[]): void {
    this._log("warn", ...args);
  }

  public error(...args: any[]): void {
    this._log("error", ...args);
  }
}
export { Logger };
