import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Env } from "../config/env.config.js";
import type { Request } from "express";
import type { Multer as MulterType, StorageEngine } from "multer";

export type CBDestination = { (error: Error | null, destination: string): void };
export type CBFileName = { (error: Error | null, filename: string): void };

class Multer {
  private readonly PROFILE_UPLOAD_PATH: string;
  private readonly POSTS_UPLOAD_PATH: string;

  private static _instance: Multer;
  private static _uploadPath: string = Env.instance.env.UPLOAD_PATH;

  private _upload: MulterType;

  private constructor(defaultPath: string) {
    this.POSTS_UPLOAD_PATH = path.join(defaultPath, "posts");
    this.PROFILE_UPLOAD_PATH = path.join(defaultPath, "profile");

    const storage: StorageEngine = multer.diskStorage({
      destination: (req: Request, _file: Express.Multer.File, cb: CBDestination): void => {
        let dest: string = defaultPath;
        if (req.path.endsWith("/upload/profile")) dest = this.PROFILE_UPLOAD_PATH;
        else if (req.path.endsWith("/create")) dest = this.POSTS_UPLOAD_PATH;

        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (_req: Request, file: Express.Multer.File, cb: CBFileName): void => {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
      },
    });
    this._upload = multer({ storage });
  }

  public static get instance(): Multer {
    if (!Multer._instance) Multer._instance = new Multer(Multer._uploadPath);
    return Multer._instance;
  }

  public get ProfileUploadPath(): string {
    return this.PROFILE_UPLOAD_PATH;
  }

  public get PostsUploadPath(): string {
    return this.POSTS_UPLOAD_PATH;
  }

  public get upload(): MulterType {
    return this._upload;
  }
}

export { Multer };
