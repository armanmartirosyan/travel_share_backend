import express from "express";
import type { Express } from "express";

const app: Express = express();

app.listen(8080, "0.0.0.0", () => {
  console.log("App is running on port 8080");
});
